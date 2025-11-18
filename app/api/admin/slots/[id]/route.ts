import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { slotSchema } from '@/lib/validators'
import { z } from 'zod'

/**
 * PATCH /api/admin/slots/[id]
 * Met à jour un créneau
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const validatedData = slotSchema.parse(body)

    const supabase = createServerClient()

    const { data: slot, error } = await supabase
      .from('slots')
      .update({
        date: validatedData.date,
        start_time: validatedData.startTime,
        end_time: validatedData.endTime,
        capacity: validatedData.capacity,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour créneau:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du créneau' },
        { status: 500 }
      )
    }

    return NextResponse.json({ slot })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur PATCH slot:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/slots/[id]
 * Supprime un créneau
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params
    const supabase = createServerClient()

    // Vérifier si le créneau est utilisé dans des commandes
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('slot_id', id)

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un créneau avec des commandes associées' },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('slots').delete().eq('id', id)

    if (error) {
      console.error('Erreur suppression créneau:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du créneau' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur DELETE slot:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
