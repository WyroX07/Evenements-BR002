import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { slotSchema } from '@/lib/validators'
import { z } from 'zod'

/**
 * GET /api/admin/slots
 * Liste tous les créneaux avec le nombre de places restantes
 */
export async function GET() {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createServerClient()

    const { data: slots, error } = await supabase
      .from('slots')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Erreur récupération créneaux:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des créneaux' },
        { status: 500 }
      )
    }

    // Calculer les places restantes pour chaque créneau
    const slotsWithRemaining = await Promise.all(
      slots.map(async (slot) => {
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

    return NextResponse.json({ slots: slotsWithRemaining })
  } catch (error) {
    console.error('Erreur GET slots:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST /api/admin/slots
 * Crée un nouveau créneau
 */
export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = slotSchema.parse(body)

    const supabase = createServerClient()

    const { data: slot, error } = await supabase
      .from('slots')
      .insert({
        date: validatedData.date,
        start_time: validatedData.startTime,
        end_time: validatedData.endTime,
        capacity: validatedData.capacity,
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur création créneau:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la création du créneau' },
        { status: 500 }
      )
    }

    return NextResponse.json({ slot }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur POST slot:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
