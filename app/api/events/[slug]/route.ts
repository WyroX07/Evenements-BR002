import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET /api/events/[slug]
 * Récupère les détails complets d'un événement par son slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const supabase = createServerClient()

    // Récupérer l'événement avec sa section
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        section:sections(
          id,
          name,
          slug,
          color,
          iban,
          iban_name
        )
      `)
      .eq('slug', slug)
      .eq('status', 'ACTIVE')
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Événement introuvable ou non actif' },
        { status: 404 }
      )
    }

    // Vérifier que l'événement est dans sa période de vente
    const today = new Date().toISOString().split('T')[0]
    if (today < event.start_date || today > event.end_date) {
      return NextResponse.json(
        { error: 'Cet événement n\'est plus disponible' },
        { status: 410 }
      )
    }

    // Récupérer les produits actifs
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('event_id', event.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (productsError) {
      console.error('Erreur récupération produits:', productsError)
    }

    // Récupérer les créneaux futurs avec capacité restante
    const { data: slots, error: slotsError } = await supabase
      .from('slots')
      .select('*')
      .eq('event_id', event.id)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    if (slotsError) {
      console.error('Erreur récupération créneaux:', slotsError)
    }

    // Calculer la capacité restante pour chaque créneau
    const slotsWithRemaining = await Promise.all(
      (slots || []).map(async (slot) => {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('slot_id', slot.id)
          .in('status', ['PENDING', 'PAID', 'PREPARED'])

        return {
          ...slot,
          bookedCount: count || 0,
          remainingCapacity: slot.capacity - (count || 0),
          isFull: (count || 0) >= slot.capacity,
        }
      })
    )

    // Statistiques de l'événement
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id)
      .in('status', ['PENDING', 'PAID', 'PREPARED', 'DELIVERED'])

    return NextResponse.json({
      event: {
        ...event,
        products: products || [],
        slots: slotsWithRemaining || [],
        stats: {
          totalOrders: totalOrders || 0,
        },
      },
    })
  } catch (error) {
    console.error('Erreur GET event by slug:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
