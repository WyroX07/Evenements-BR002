import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET /api/orders/details/[id]
 * Récupère les détails d'une commande publique (pour la page de confirmation)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    console.log('[GET /api/orders/details/[id]] Fetching order:', orderId)
    const supabase = createServerClient() as any

    // Récupérer la commande de base
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError) {
      console.error('[GET /api/orders/details/[id]] Order error:', orderError)
      return NextResponse.json(
        { error: 'Commande introuvable', details: orderError },
        { status: 404 }
      )
    }

    if (!order) {
      console.log('[GET /api/orders/details/[id]] Order not found')
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    console.log('[GET /api/orders/details/[id]] Order found:', order.id)

    // Récupérer l'événement
    const { data: event } = await supabase
      .from('events')
      .select('id, name, slug')
      .eq('id', order.event_id)
      .single()

    // Récupérer le slot si présent
    let slot = null
    if (order.slot_id) {
      const { data: slotData } = await supabase
        .from('slots')
        .select('date, start_time, end_time')
        .eq('id', order.slot_id)
        .single()
      slot = slotData
    }

    // Récupérer les items
    const { data: items } = await supabase
      .from('order_items')
      .select('product_name, quantity, unit_price_cents')
      .eq('order_id', order.id)

    // Construire la réponse
    const orderWithDetails = {
      ...order,
      event,
      slot,
      items: items || []
    }

    console.log('[GET /api/orders/details/[id]] Returning order with details')
    return NextResponse.json({ order: orderWithDetails })
  } catch (error) {
    console.error('[GET /api/orders/details/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la commande' },
      { status: 500 }
    )
  }
}
