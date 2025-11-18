import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET /api/sections
 * Liste toutes les sections scoutes
 */
export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: sections, error } = await supabase
      .from('sections')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Erreur récupération sections:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des sections' },
        { status: 500 }
      )
    }

    // Pour chaque section, compter les événements actifs
    const sectionsWithCounts = await Promise.all(
      (sections || []).map(async (section) => {
        const { count } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('section_id', section.id)
          .eq('status', 'ACTIVE')

        return {
          ...section,
          activeEventsCount: count || 0,
        }
      })
    )

    return NextResponse.json({ sections: sectionsWithCounts })
  } catch (error) {
    console.error('Erreur GET sections:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
