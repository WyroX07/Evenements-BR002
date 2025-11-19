import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET /api/orders/[code]
 * Récupère une commande par son code unique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    if (!code || code.length < 6) {
      return NextResponse.json(
        { error: 'Code de commande invalide' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Récupérer la commande avec tous les détails
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        event:events(
          id,
          name,
          slug,
          start_date,
          end_date,
          config,
          section:sections(
            id,
            name,
            iban,
            iban_name
          )
        ),
        items:order_items(
          id,
          quantity,
          unit_price_cents,
          total_price_cents,
          product:products(
            id,
            name,
            description,
            product_type
          )
        ),
        promo_code:promo_codes(
          id,
          code,
          discount_cents,
          description
        )
      `)
      .eq('order_code', code.toUpperCase())
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error in GET /api/orders/[code]:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
