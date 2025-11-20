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

/**
 * Formate un prix en centimes vers euros avec 2 décimales
 */
function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2)
}

/**
 * Formate une date ISO en format lisible DD/MM/YYYY
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Formate un créneau
 */
function formatSlot(slot: any): string {
  if (!slot) return ''
  const date = formatDate(slot.date)
  return `${date} ${slot.start_time}-${slot.end_time}`
}

/**
 * Formate le type de livraison
 */
function formatDeliveryType(type: string): string {
  switch (type) {
    case 'PICKUP': return 'Retrait'
    case 'DELIVERY': return 'Livraison'
    case 'ON_SITE': return 'Sur place'
    default: return type
  }
}

/**
 * Formate le statut
 */
function formatStatus(status: string): string {
  switch (status) {
    case 'PENDING': return 'En attente'
    case 'PAID': return 'Payé'
    case 'PREPARED': return 'Préparé'
    case 'DELIVERED': return 'Livré'
    case 'CANCELLED': return 'Annulé'
    default: return status
  }
}

/**
 * Échappe les virgules et guillemets pour CSV
 */
function escapeCsv(value: string | null | undefined): string {
  if (!value) return ''
  const str = String(value)
  // Si contient virgule, guillemet ou retour ligne, entourer de guillemets et doubler les guillemets
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * GET /api/admin/orders/export
 * Exporte toutes les commandes en CSV
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

    const supabase = createServerClient() as any

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
            slug
          )
        ),
        slot:slots(
          id,
          date,
          start_time,
          end_time,
          location
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
      console.error('Erreur récupération commandes pour export:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des commandes' },
        { status: 500 }
      )
    }

    let filteredOrders = orders || []

    // Filtre par section (via event)
    if (sectionId) {
      filteredOrders = filteredOrders.filter(
        (order: any) => order.event?.section?.id === sectionId
      )
    }

    // Récupérer les items pour chaque commande
    const ordersWithItems = await Promise.all(
      filteredOrders.map(async (order: any) => {
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

    // Générer le CSV
    const headers = [
      'Code',
      'Date',
      'Événement',
      'Section',
      'Nom',
      'Email',
      'Téléphone',
      'Produits',
      'Quantités',
      'Créneau',
      'Type livraison',
      'Adresse',
      'Code postal',
      'Ville',
      'Sous-total (€)',
      'Remise 10pour9 (€)',
      'Frais livraison (€)',
      'Code promo',
      'Remise promo (€)',
      'Total (€)',
      'Statut',
      'Méthode paiement',
      'Communication virement',
      'Notes'
    ]

    const rows = ordersWithItems.map((order) => {
      const productsNames = order.items.map((item: any) => item.product?.name || 'Inconnu').join('; ')
      const productsQty = order.items.map((item: any) => `${item.qty}x`).join('; ')

      return [
        escapeCsv(order.code),
        formatDate(order.created_at),
        escapeCsv(order.event?.name || ''),
        escapeCsv(order.event?.section?.name || ''),
        escapeCsv(order.customer_name),
        escapeCsv(order.email),
        escapeCsv(order.phone),
        escapeCsv(productsNames),
        escapeCsv(productsQty),
        escapeCsv(formatSlot(order.slot)),
        formatDeliveryType(order.delivery_type),
        escapeCsv(order.address || ''),
        escapeCsv(order.zip || ''),
        escapeCsv(order.city || ''),
        formatPrice(order.subtotal_cents || 0),
        formatPrice(order.discount_cents || 0),
        formatPrice(order.delivery_fee_cents || 0),
        escapeCsv(order.promo_code || ''),
        formatPrice(order.promo_discount_cents || 0),
        formatPrice(order.total_cents),
        formatStatus(order.status),
        escapeCsv(order.payment_method || ''),
        escapeCsv(order.payment_communication || ''),
        escapeCsv(order.notes || '')
      ]
    })

    // Construire le CSV avec BOM UTF-8 pour Excel
    const BOM = '\uFEFF'
    const csvContent = BOM + [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Nom du fichier avec timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = eventId
      ? `commandes_${ordersWithItems[0]?.event?.slug || 'event'}_${timestamp}.csv`
      : `commandes_${timestamp}.csv`

    // Retourner le CSV
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Erreur export commandes:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
