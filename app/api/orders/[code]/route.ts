import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import QRCode from 'qrcode'

/**
 * GET /api/orders/[code]
 * Recupere les details d'une commande par son code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const supabase = createServerClient() as any

    // Recuperer la commande avec toutes les relations
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        event:events(
          id,
          slug,
          name,
          event_type,
          section:sections(
            id,
            name,
            slug,
            color,
            iban,
            iban_name
          )
        ),
        slot:slots(
          id,
          date,
          start_time,
          end_time
        ),
        items:order_items(
          id,
          product_id,
          qty,
          unit_price_cents,
          product:products(
            id,
            name,
            product_type
          )
        )
      `)
      .eq('code', code)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    // Construire l'adresse complete si livraison
    const deliveryAddress = order.address && order.city && order.zip
      ? `${order.address}, ${order.zip} ${order.city}`
      : null

    // Reformater les donnees pour correspondre au format attendu par la page
    const formattedOrder = {
      id: order.id,
      code: order.code,
      customer_name: order.customer_name,
      email: order.email,
      phone: order.phone,
      delivery_type: order.delivery_type,
      delivery_address: deliveryAddress,
      payment_method: order.payment_method,
      payment_communication: order.payment_communication,
      subtotal_cents: order.subtotal_cents || 0,
      discount_cents: order.discount_cents || 0,
      promo_discount_cents: order.promo_discount_cents || 0,
      promo_code: order.promo_code || null,
      delivery_fee_cents: order.delivery_fee_cents || 0,
      total_cents: order.total_cents,
      status: order.status,
      created_at: order.created_at,
      event: order.event,
      slot: order.slot,
      items: order.items.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.qty,
        unit_price_cents: item.unit_price_cents,
        product: item.product,
      })),
    }

    // Generer le QR code avec URL vers la page admin de scan
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    const scanUrl = `${baseUrl}/admin/scan/${order.code}`

    const qrCodeDataUrl = await QRCode.toDataURL(scanUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    return NextResponse.json({
      order: formattedOrder,
      qrCodeDataUrl,
    })
  } catch (error) {
    console.error('Erreur GET order by code:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
