import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient() as any

    const { data: events, error } = await supabase
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

    if (error) {
      console.error('Erreur récupération événements:', error)
      return NextResponse.json({ events: [] })
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

    return NextResponse.json({ events: eventsWithStats || [] })
  } catch (error) {
    console.error('Erreur fetch événements:', error)
    return NextResponse.json({ events: [] })
  }
}
