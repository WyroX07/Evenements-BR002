import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

const bulkDeleteSchema = z.object({
  slotIds: z.array(z.string()).min(1),
})

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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await checkAdminAuth())) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: eventId } = await params
    const supabase = createServerClient() as any

    const body = await req.json()
    const validatedData = bulkDeleteSchema.parse(body)
    const { slotIds } = validatedData

    // Vérifier que tous les créneaux appartiennent à cet événement
    const { data: slots, error: slotsError } = await supabase
      .from('slots')
      .select('id, date, start_time, end_time')
      .eq('event_id', eventId)
      .in('id', slotIds)

    if (slotsError) {
      console.error('Erreur récupération créneaux:', slotsError)
      return NextResponse.json({ error: 'Erreur lors de la récupération des créneaux' }, { status: 500 })
    }

    if (slots.length !== slotIds.length) {
      return NextResponse.json(
        { error: 'Certains créneaux sont introuvables ou n\'appartiennent pas à cet événement' },
        { status: 404 }
      )
    }

    // Vérifier qu'aucun créneau n'a de réservations
    const { data: ordersCount } = await supabase
      .from('orders')
      .select('slot_id', { count: 'exact', head: true })
      .in('slot_id', slotIds)
      .in('status', ['PENDING', 'PAID', 'PREPARED'])

    if (ordersCount && ordersCount.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer des créneaux avec des réservations actives' },
        { status: 400 }
      )
    }

    // Supprimer tous les créneaux
    const { error: deleteError } = await supabase.from('slots').delete().in('id', slotIds)

    if (deleteError) {
      console.error('Erreur suppression créneaux:', deleteError)
      return NextResponse.json({ error: 'Erreur lors de la suppression des créneaux' }, { status: 500 })
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      event_id: eventId,
      action: 'SLOTS_BULK_DELETED',
      meta: {
        count: slotIds.length,
        slot_ids: slotIds,
      },
    })

    return NextResponse.json({
      success: true,
      count: slotIds.length,
      message: `${slotIds.length} créneau${slotIds.length > 1 ? 'x' : ''} supprimé${slotIds.length > 1 ? 's' : ''}`,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 })
    }

    console.error('Erreur suppression en masse:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}
