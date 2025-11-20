import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { cuveeSchema } from '@/lib/validators'
import { z } from 'zod'

/**
 * PATCH /api/admin/cuvees/[id]
 * Met à jour une cuvée
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = cuveeSchema.parse(body)

    const supabase = createServerClient() as any

    const { data: cuvee, error } = await supabase
      .from('cuvees')
      .update({
        name: validatedData.name,
        description: validatedData.description,
        price_cents: validatedData.priceCents,
        is_active: validatedData.isActive,
        stock: validatedData.stock,
        sort_order: validatedData.sortOrder,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour cuvée:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de la cuvée' },
        { status: 500 }
      )
    }

    return NextResponse.json({ cuvee })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur PATCH cuvee:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/cuvees/[id]
 * Supprime une cuvée
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createServerClient() as any

    // Vérifier si la cuvée est utilisée dans des commandes
    const { count } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('cuvee_id', id)

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une cuvée utilisée dans des commandes' },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('cuvees').delete().eq('id', id)

    if (error) {
      console.error('Erreur suppression cuvée:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de la cuvée' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur DELETE cuvee:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
