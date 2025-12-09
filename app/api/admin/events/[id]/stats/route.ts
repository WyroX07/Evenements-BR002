import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

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

interface ProductStats {
  product_id: string
  product_name: string
  producer: string | null
  total_quantity: number
  total_revenue_cents: number
  unit_price_cents: number
}

interface SupplierStats {
  supplier: string
  total_revenue_cents: number
  total_quantity: number
  products_count: number
}

/**
 * GET /api/admin/events/[id]/stats
 * Récupère les statistiques détaillées d'un événement
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createServerClient() as any

    // Vérifier que l'événement existe
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        section:sections(
          id,
          name,
          slug,
          color
        )
      `)
      .eq('id', id)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    // Récupérer toutes les commandes de l'événement
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('event_id', id)

    if (ordersError) {
      console.error('Erreur récupération commandes:', ordersError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des commandes' },
        { status: 500 }
      )
    }

    // Récupérer tous les items de commande avec les infos produits
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(
          id,
          name,
          producer,
          price_cents
        )
      `)
      .in('order_id', (orders || []).map((o: any) => o.id))

    if (itemsError) {
      console.error('Erreur récupération items:', itemsError)
    }

    // Calculer les stats globales
    const totalOrders = orders?.length || 0
    const totalRevenueCents = orders?.reduce((sum, o) => sum + (o.total_cents || 0), 0) || 0
    const totalItems = orderItems?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0

    // Grouper par statut
    const ordersByStatus = (orders || []).reduce((acc: Record<string, number>, order: any) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {})

    // Grouper par type de livraison
    const ordersByDeliveryType = (orders || []).reduce((acc: Record<string, number>, order: any) => {
      acc[order.delivery_type] = (acc[order.delivery_type] || 0) + 1
      return acc
    }, {})

    // Grouper par méthode de paiement
    const ordersByPaymentMethod = (orders || []).reduce((acc: Record<string, number>, order: any) => {
      acc[order.payment_method] = (acc[order.payment_method] || 0) + 1
      return acc
    }, {})

    // Stats par produit
    const productStatsMap = new Map<string, ProductStats>()

    orderItems?.forEach((item: any) => {
      if (!item.product) return

      const productId = item.product.id
      const existing = productStatsMap.get(productId)

      if (existing) {
        existing.total_quantity += item.qty
        existing.total_revenue_cents += item.line_total_cents
      } else {
        productStatsMap.set(productId, {
          product_id: productId,
          product_name: item.product.name,
          producer: item.product.producer || null,
          total_quantity: item.qty,
          total_revenue_cents: item.line_total_cents,
          unit_price_cents: item.unit_price_cents,
        })
      }
    })

    const productStats = Array.from(productStatsMap.values())
      .sort((a, b) => b.total_revenue_cents - a.total_revenue_cents)

    // Stats par fournisseur (pour la vente de crémant)
    const supplierStatsMap = new Map<string, SupplierStats>()

    productStats.forEach((productStat) => {
      const supplier = productStat.producer || 'Non spécifié'
      const existing = supplierStatsMap.get(supplier)

      if (existing) {
        existing.total_revenue_cents += productStat.total_revenue_cents
        existing.total_quantity += productStat.total_quantity
        existing.products_count += 1
      } else {
        supplierStatsMap.set(supplier, {
          supplier,
          total_revenue_cents: productStat.total_revenue_cents,
          total_quantity: productStat.total_quantity,
          products_count: 1,
        })
      }
    })

    const supplierStats = Array.from(supplierStatsMap.values())
      .sort((a, b) => b.total_revenue_cents - a.total_revenue_cents)

    // Stats sur les revenus
    const revenueStats = {
      subtotal_cents: orders?.reduce((sum, o) => sum + (o.subtotal_cents || 0), 0) || 0,
      discount_cents: orders?.reduce((sum, o) => sum + (o.discount_cents || 0), 0) || 0,
      delivery_fees_cents: orders?.reduce((sum, o) => sum + (o.delivery_fee_cents || 0), 0) || 0,
      total_cents: totalRevenueCents,
    }

    // Calculer la moyenne par commande
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenueCents / totalOrders) : 0
    const averageItemsPerOrder = totalOrders > 0 ? Math.round(totalItems / totalOrders) : 0

    return NextResponse.json({
      event: {
        id: event.id,
        name: event.name,
        slug: event.slug,
        event_type: event.event_type,
        status: event.status,
        section: event.section,
      },
      stats: {
        // Stats globales
        totalOrders,
        totalRevenueCents,
        totalItems,
        averageOrderValue,
        averageItemsPerOrder,

        // Répartition
        ordersByStatus,
        ordersByDeliveryType,
        ordersByPaymentMethod,

        // Revenus détaillés
        revenue: revenueStats,

        // Stats par produit
        productStats,

        // Stats par fournisseur (Lissner vs autres)
        supplierStats,
      },
    })
  } catch (error) {
    console.error('Erreur GET admin event stats:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
