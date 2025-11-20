import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { updateOrderStatusSchema, updateOrderNotesSchema } from '@/lib/validators'
import { z } from 'zod'

/**
 * PATCH /api/admin/orders/[id]
 * Met à jour une commande (statut, notes, etc.)
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
    const supabase = createServerClient()

    // Déterminer le type de mise à jour
    if (body.status) {
      // Changement de statut
      const { status, override } = updateOrderStatusSchema.parse({ ...body, orderId: id })

      // Récupérer la commande actuelle
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*, slot:slots(capacity)')
        .eq('id', id)
        .single()

      if (fetchError || !order) {
        return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
      }

      // Vérifications selon le statut cible
      if (status === 'PAID' && order.slot_id && !override) {
        // Vérifier la capacité du créneau
        const { count: slotOrdersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('slot_id', order.slot_id)
          .in('status', ['PAID', 'PREPARED'])
          .neq('id', id)

        if ((slotOrdersCount || 0) >= order.slot.capacity) {
          return NextResponse.json(
            { error: 'Créneau complet. Utilisez override=true pour forcer.' },
            { status: 400 }
          )
        }
      }

      // Mettre à jour le statut
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)

      if (updateError) {
        console.error('Erreur mise à jour statut:', updateError)
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour' },
          { status: 500 }
        )
      }

      // TODO: Gérer la gestion du stock selon les transitions
      // PAID → PREPARED : décrémenter stock
      // * → CANCELLED : restaurer stock

      return NextResponse.json({ success: true })
    } else {
      // Mise à jour des notes / références
      const validatedData = updateOrderNotesSchema.parse({ ...body, orderId: id })

      const updates: any = {}
      if (validatedData.bankReference !== undefined) {
        updates.bank_reference = validatedData.bankReference
      }
      if (validatedData.adminInternalNote !== undefined) {
        updates.admin_internal_note = validatedData.adminInternalNote
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)

      if (updateError) {
        console.error('Erreur mise à jour notes:', updateError)
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur PATCH order:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
