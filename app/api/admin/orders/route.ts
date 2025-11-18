import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

/**
 * Vérifie si l'utilisateur est authentifié comme admin
 */
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
  bank_reference: z.string().optional(),
  admin_internal_note: z.string().optional(),
})

/**
 * GET /api/admin/orders
 * Liste toutes les commandes avec filtrage par événement, section, statut, etc.
 */
export async function GET(request: NextRequest) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('event_id')
    const sectionId = searchParams.get('section_id')
    const status = searchParams.get('status')
    const deliveryType = searchParams.get('delivery_type')
    const slotId = searchParams.get('slot_id')
    const search = searchParams.get('search') // Recherche par nom/email/code

    const supabase = createServerClient()

    let query = supabase
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
      .order('created_at', { ascending: false })

    // Filtres
    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    if (status && ['PENDING', 'PAID', 'PREPARED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      query = query.eq('status', status)
    }

    if (deliveryType && ['PICKUP', 'DELIVERY', 'ON_SITE'].includes(deliveryType)) {
      query = query.eq('delivery_type', deliveryType)
    }

    if (slotId) {
      query = query.eq('slot_id', slotId)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Erreur récupération commandes admin:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des commandes' },
        { status: 500 }
      )
    }

    let filteredOrders = orders || []

    // Filtre par section (via event)
    if (sectionId) {
      filteredOrders = filteredOrders.filter(
        (order) => order.event?.section?.id === sectionId
      )
    }

    // Recherche textuelle
    if (search) {
      const searchLower = search.toLowerCase()
      filteredOrders = filteredOrders.filter(
        (order) =>
          order.customer_name.toLowerCase().includes(searchLower) ||
          order.email.toLowerCase().includes(searchLower) ||
          order.code.toLowerCase().includes(searchLower) ||
          order.phone.includes(search)
      )
    }

    // Récupérer les items pour chaque commande
    const ordersWithItems = await Promise.all(
      filteredOrders.map(async (order) => {
        const { data: items } = await supabase
          .from('order_items')
          .select(`
            *,
            product:products(
              id,
              name,
              product_type
            )
          `)
          .eq('order_id', order.id)

        return {
          ...order,
          items: items || [],
        }
      })
    )

    return NextResponse.json({ orders: ordersWithItems })
  } catch (error) {
    console.error('Erreur GET admin orders:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Met à jour le statut ou les notes d'une commande
 */
export async function PATCH(request: NextRequest) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID de commande manquant' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateOrderSchema.parse(body)

    const supabase = createServerClient()

    // Vérifier que la commande existe
    const { data: existingOrder, error: existingError } = await supabase
      .from('orders')
      .select('code, status, event:events(name)')
      .eq('id', orderId)
      .single()

    if (existingError || !existingOrder) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    // Mettre à jour la commande
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update(validatedData)
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur mise à jour commande:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de la commande' },
        { status: 500 }
      )
    }

    // Log audit si changement de statut
    if (validatedData.status && validatedData.status !== existingOrder.status) {
      await supabase.from('audit_logs').insert({
        order_id: orderId,
        action: 'ORDER_STATUS_CHANGED',
        meta: {
          order_code: existingOrder.code,
          old_status: existingOrder.status,
          new_status: validatedData.status,
        },
      })
    }

    return NextResponse.json({ order })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur PATCH admin order:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/orders/[id]
 * Annule une commande (marque comme CANCELLED, ne supprime pas)
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID de commande manquant' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Vérifier que la commande existe
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('code, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    // Annuler la commande (ne pas supprimer pour traçabilité)
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'CANCELLED' })
      .eq('id', orderId)

    if (updateError) {
      console.error('Erreur annulation commande:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'annulation de la commande' },
        { status: 500 }
      )
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      order_id: orderId,
      action: 'ORDER_CANCELLED',
      meta: {
        order_code: order.code,
        previous_status: order.status,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur DELETE admin order:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
