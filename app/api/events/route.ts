import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET /api/events
 * Liste tous les événements actifs (statut ACTIVE et dans la période)
 * Peut être filtré par section
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sectionSlug = searchParams.get('section') // Optionnel: filtrer par section

    const supabase = createServerClient() as any

    let query = supabase
      .from('events')
      .select(`
        *,
        section:sections(
          id,
          name,
          slug,
          color
        )
      `)
      .eq('status', 'ACTIVE')
      .lte('start_date', new Date().toISOString().split('T')[0])
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true })

    // Filtrer par section si demandé
    if (sectionSlug) {
      const { data: section } = await supabase
        .from('sections')
        .select('id')
        .eq('slug', sectionSlug)
        .single()

      if (section) {
        query = query.eq('section_id', section.id)
      }
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Erreur récupération événements:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des événements' },
        { status: 500 }
      )
    }

    // Pour chaque événement, compter les commandes pour stats
    const eventsWithStats = await Promise.all(
      (events || []).map(async (event: any) => {
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .in('status', ['PENDING', 'PAID', 'PREPARED', 'DELIVERED'])

        return {
          ...event,
          stats: {
            ordersCount: ordersCount || 0,
          },
        }
      })
    )

    return NextResponse.json({ events: eventsWithStats })
  } catch (error) {
    console.error('Erreur GET events:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
