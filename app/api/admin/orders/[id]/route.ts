import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

async function checkAdminAuth() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')
  if (!adminSession || adminSession.value !== 'authenticated') {
    return false
  }
  return true
}

const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'PREPARED', 'DELIVERED', 'CANCELLED']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createServerClient() as any

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        event:events(
          id,
          name,
          slug,
          section:sections(
            id,
            name,
            slug,
            color
          )
        ),
        slot:slots(
          id,
          date,
          start_time,
          end_time
        )
      `)
      .eq('id', id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    const { data: items } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(id, name, product_type)
      `)
      .eq('order_id', id)

    return NextResponse.json({ order: { ...order, items: items || [] } })
  } catch (error) {
    console.error('Error GET order:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateOrderSchema.parse(body)
    const supabase = createServerClient() as any

    // Get current order to check previous status
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchError || !currentOrder) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    const oldStatus = currentOrder.status
    const newStatus = validatedData.status

    // Update order status
    const { data: order, error } = await supabase
      .from('orders')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Erreur mise a jour' }, { status: 500 })
    }

    // Handle stock restoration/deduction based on status change
    if (newStatus && oldStatus !== newStatus) {
      // Get order items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, qty')
        .eq('order_id', id)

      if (orderItems && orderItems.length > 0) {
        // If changing TO cancelled: restore stock
        if (newStatus === 'CANCELLED' && oldStatus !== 'CANCELLED') {
          console.log(`[PATCH order ${id}] Restoring stock for cancelled order`)
          for (const item of orderItems) {
            const { error: stockError } = await supabase.rpc('increment_product_stock', {
              product_id: item.product_id,
              quantity: item.qty
            })
            if (stockError) {
              console.error('[PATCH order] Error restoring stock:', stockError)
            }
          }
        }
        // If changing FROM cancelled to active status: deduct stock again
        else if (oldStatus === 'CANCELLED' && newStatus !== 'CANCELLED') {
          console.log(`[PATCH order ${id}] Deducting stock for reactivated order`)
          for (const item of orderItems) {
            const { error: stockError } = await supabase.rpc('decrement_product_stock', {
              product_id: item.product_id,
              quantity: item.qty
            })
            if (stockError) {
              console.error('[PATCH order] Error deducting stock:', stockError)
            }
          }
        }
      }
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error PATCH order:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
