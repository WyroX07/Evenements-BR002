import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { cuveeSchema } from '@/lib/validators'
import { z } from 'zod'

/**
 * GET /api/admin/cuvees
 * Liste toutes les cuvées
 */
export async function GET() {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createServerClient()

    const { data: cuvees, error } = await supabase
      .from('cuvees')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Erreur récupération cuvées:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des cuvées' },
        { status: 500 }
      )
    }

    return NextResponse.json({ cuvees })
  } catch (error) {
    console.error('Erreur GET cuvees:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST /api/admin/cuvees
 * Crée une nouvelle cuvée
 */
export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = cuveeSchema.parse(body)

    const supabase = createServerClient()

    const { data: cuvee, error } = await supabase
      .from('cuvees')
      .insert({
        name: validatedData.name,
        description: validatedData.description,
        price_cents: validatedData.priceCents,
        is_active: validatedData.isActive,
        stock: validatedData.stock,
        sort_order: validatedData.sortOrder,
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur création cuvée:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la cuvée' },
        { status: 500 }
      )
    }

    return NextResponse.json({ cuvee }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur POST cuvee:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
