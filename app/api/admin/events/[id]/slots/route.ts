import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

/**
 * Vérifie si l'utilisateur est authentifié comme admin
 */
async function checkAdminAuth() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')

  if (!adminSession || adminSession.value !== 'authenticated') {
    return false
  }
  return true
}

const slotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  capacity: z.number().int().min(1),
})

const updateSlotSchema = slotSchema.partial()

/**
 * GET /api/admin/events/[id]/slots
 * Liste tous les créneaux d'un événement
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: eventId } = params
    const supabase = createServerClient() as any

    // Vérifier que l'événement existe
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    // Récupérer tous les créneaux avec stats
    const { data: slots, error: slotsError } = await supabase
      .from('slots')
      .select('*')
      .eq('event_id', eventId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    if (slotsError) {
      console.error('Erreur récupération créneaux:', slotsError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des créneaux' },
        { status: 500 }
      )
    }

    // Ajouter les stats de réservation pour chaque créneau
    const slotsWithStats = await Promise.all(
      (slots || []).map(async (slot: any) => {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('slot_id', slot.id)
          .in('status', ['PENDING', 'PAID', 'PREPARED'])

        return {
          ...slot,
          bookedCount: count || 0,
          remainingCapacity: slot.capacity - (count || 0),
        }
      })
    )

    return NextResponse.json({ slots: slotsWithStats })
  } catch (error) {
    console.error('Erreur GET admin slots:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST /api/admin/events/[id]/slots
 * Crée un nouveau créneau pour un événement
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: eventId } = params
    const body = await request.json()
    const validatedData = slotSchema.parse(body)

    const supabase = createServerClient() as any

    // Vérifier que l'événement existe
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    // Vérifier que start_time < end_time
    if (validatedData.start_time >= validatedData.end_time) {
      return NextResponse.json(
        { error: 'L\'heure de début doit être avant l\'heure de fin' },
        { status: 400 }
      )
    }

    // Créer le créneau
    const { data: slot, error: slotError } = await supabase
      .from('slots')
      .insert({
        event_id: eventId,
        date: validatedData.date,
        start_time: validatedData.start_time,
        end_time: validatedData.end_time,
        capacity: validatedData.capacity,
      })
      .select()
      .single()

    if (slotError) {
      console.error('Erreur création créneau:', slotError)
      return NextResponse.json(
        { error: 'Erreur lors de la création du créneau' },
        { status: 500 }
      )
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      event_id: eventId,
      action: 'SLOT_CREATED',
      meta: {
        slot_date: slot.date,
        slot_time: `${slot.start_time}-${slot.end_time}`,
        event_name: event.name,
      },
    })

    return NextResponse.json({ slot }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur POST admin slot:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/events/[id]/slots/[slotId]
 * Met à jour un créneau
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slotId = searchParams.get('slotId')

    if (!slotId) {
      return NextResponse.json(
        { error: 'ID du créneau manquant' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateSlotSchema.parse(body)

    const supabase = createServerClient() as any

    // Vérifier que le créneau existe et appartient à cet événement
    const { data: existingSlot, error: existingError } = await supabase
      .from('slots')
      .select('*')
      .eq('id', slotId)
      .eq('event_id', params.id)
      .single()

    if (existingError || !existingSlot) {
      return NextResponse.json(
        { error: 'Créneau introuvable' },
        { status: 404 }
      )
    }

    // Vérifier que start_time < end_time si les deux sont fournis
    const finalStartTime = validatedData.start_time || existingSlot.start_time
    const finalEndTime = validatedData.end_time || existingSlot.end_time

    if (finalStartTime >= finalEndTime) {
      return NextResponse.json(
        { error: 'L\'heure de début doit être avant l\'heure de fin' },
        { status: 400 }
      )
    }

    // Si on réduit la capacité, vérifier qu'on ne dépasse pas le nombre de réservations
    if (validatedData.capacity !== undefined) {
      const { count: bookedCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('slot_id', slotId)
        .in('status', ['PENDING', 'PAID', 'PREPARED'])

      if (validatedData.capacity < (bookedCount || 0)) {
        return NextResponse.json(
          {
            error: `Impossible de réduire la capacité en dessous de ${bookedCount} (réservations actuelles)`,
          },
          { status: 400 }
        )
      }
    }

    // Mettre à jour le créneau
    const { data: slot, error: updateError } = await supabase
      .from('slots')
      .update(validatedData)
      .eq('id', slotId)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur mise à jour créneau:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du créneau' },
        { status: 500 }
      )
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      event_id: params.id,
      action: 'SLOT_UPDATED',
      meta: {
        slot_date: slot.date,
        updated_fields: Object.keys(validatedData),
      },
    })

    return NextResponse.json({ slot })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur PATCH admin slot:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/events/[id]/slots/[slotId]
 * Supprime un créneau (seulement si aucune réservation)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slotId = searchParams.get('slotId')

    if (!slotId) {
      return NextResponse.json(
        { error: 'ID du créneau manquant' },
        { status: 400 }
      )
    }

    const supabase = createServerClient() as any

    // Vérifier que le créneau existe
    const { data: slot, error: slotError } = await supabase
      .from('slots')
      .select('date, start_time, end_time')
      .eq('id', slotId)
      .eq('event_id', params.id)
      .single()

    if (slotError || !slot) {
      return NextResponse.json(
        { error: 'Créneau introuvable' },
        { status: 404 }
      )
    }

    // Vérifier qu'il n'y a aucune réservation
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('slot_id', slotId)

    if ((ordersCount || 0) > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un créneau avec des réservations' },
        { status: 400 }
      )
    }

    // Supprimer le créneau
    const { error: deleteError } = await supabase
      .from('slots')
      .delete()
      .eq('id', slotId)

    if (deleteError) {
      console.error('Erreur suppression créneau:', deleteError)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du créneau' },
        { status: 500 }
      )
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      event_id: params.id,
      action: 'SLOT_DELETED',
      meta: {
        slot_date: slot.date,
        slot_time: `${slot.start_time}-${slot.end_time}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur DELETE admin slot:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
