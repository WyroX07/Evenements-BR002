import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createOrderSchema } from '@/lib/validators'
import { calculateOrderTotals, meetsDeliveryMinimum, validateStock } from '@/lib/calculations'
import { generateOrderCode } from '@/lib/utils'
import { z } from 'zod'

/**
 * POST /api/orders (VERSION 2 - Multi-événements)
 * Crée une nouvelle commande pour un événement spécifique
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Ajouter event_id au schéma de validation
    const orderSchemaV2 = createOrderSchema.extend({
      eventId: z.string().uuid('ID d\'événement invalide'),
    })

    const validatedData = orderSchemaV2.parse(body)

    const supabase = createServerClient()

    // 1. Récupérer l'événement avec sa section
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        section:sections(
          id,
          iban,
          iban_name
        )
      `)
      .eq('id', validatedData.eventId)
      .eq('status', 'ACTIVE')
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Événement introuvable ou non actif' },
        { status: 404 }
      )
    }

    // Vérifier la période de vente
    const today = new Date().toISOString().split('T')[0]
    if (today < event.start_date || today > event.end_date) {
      return NextResponse.json(
        { error: 'Les commandes ne sont plus acceptées pour cet événement' },
        { status: 410 }
      )
    }

    // 2. Récupérer les produits pour validation
    const productIds = validatedData.items.map((item) => item.cuveeId)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price_cents, stock, is_active')
      .eq('event_id', event.id)
      .in('id', productIds)

    if (productsError) {
      console.error('Erreur récupération produits:', productsError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des produits' },
        { status: 500 }
      )
    }

    // Valider que tous les produits existent et sont actifs
    const productMap = new Map(products.map((p) => [p.id, p]))

    for (const item of validatedData.items) {
      const product = productMap.get(item.cuveeId)
      if (!product || !product.is_active) {
        return NextResponse.json(
          { error: `Produit ${item.cuveeId} non disponible` },
          { status: 400 }
        )
      }

      // Vérifier que le prix correspond
      if (item.unitPriceCents !== product.price_cents) {
        return NextResponse.json(
          { error: `Le prix de ${product.name} ne correspond pas` },
          { status: 400 }
        )
      }
    }

    // 3. Récupérer la config de l'événement
    const config = event.config || {}
    const deliveryEnabled = config.delivery_enabled || false
    const deliveryMinBottles = config.delivery_min_bottles || 5
    const deliveryFeeCents = config.delivery_fee_cents || 0
    const allowedZipCodes = config.allowed_zip_codes || []
    const discount10for9 = config.discount_10for9 || false

    // 4. Validations selon le type de livraison
    if (validatedData.deliveryType === 'DELIVERY') {
      if (!deliveryEnabled) {
        return NextResponse.json(
          { error: 'La livraison n\'est pas disponible pour cet événement' },
          { status: 400 }
        )
      }

      if (!meetsDeliveryMinimum(validatedData.items, deliveryMinBottles)) {
        return NextResponse.json(
          { error: `Minimum ${deliveryMinBottles} articles requis pour la livraison` },
          { status: 400 }
        )
      }

      if (allowedZipCodes.length > 0 && !allowedZipCodes.includes(validatedData.zip!)) {
        return NextResponse.json(
          { error: 'Livraison non disponible pour ce code postal' },
          { status: 400 }
        )
      }
    }

    if (validatedData.deliveryType === 'PICKUP' || validatedData.deliveryType === 'ON_SITE') {
      // Vérifier le créneau
      const { data: slot, error: slotError } = await supabase
        .from('slots')
        .select('id, capacity, event_id')
        .eq('id', validatedData.slotId!)
        .eq('event_id', event.id)
        .single()

      if (slotError || !slot) {
        return NextResponse.json(
          { error: 'Créneau invalide ou introuvable' },
          { status: 400 }
        )
      }

      // Vérifier la capacité
      const { count: slotOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('slot_id', validatedData.slotId!)
        .in('status', ['PENDING', 'PAID', 'PREPARED'])

      if ((slotOrdersCount || 0) >= slot.capacity) {
        return NextResponse.json(
          { error: 'Ce créneau est complet' },
          { status: 400 }
        )
      }
    }

    // 5. Valider le stock
    const stockValidation = validateStock(
      validatedData.items,
      products.map((p) => ({ id: p.id, stock: p.stock }))
    )

    if (!stockValidation.valid) {
      return NextResponse.json(
        { error: stockValidation.errors.join(', ') },
        { status: 400 }
      )
    }

    // 6. Calculer les totaux
    const deliveryFee = validatedData.deliveryType === 'DELIVERY' ? deliveryFeeCents : 0
    const totals = calculateOrderTotals(validatedData.items, discount10for9, deliveryFee)

    // 7. Générer le code de commande
    const year = new Date().getFullYear()
    const prefix = config.order_code_prefix || 'ORD'

    // Compter les commandes de cet événement pour le numéro
    const { count: eventOrderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id)

    const orderNumber = (eventOrderCount || 0) + 1
    const orderCode = `${prefix}-${year}-${orderNumber.toString().padStart(5, '0')}`

    // 8. Générer la communication de virement
    const paymentCommunication = generatePaymentCommunication(
      validatedData.customerName,
      event.name
    )

    // 9. Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        event_id: event.id,
        code: orderCode,
        status: 'PENDING',
        customer_name: validatedData.customerName,
        email: validatedData.email,
        phone: validatedData.phone,
        delivery_type: validatedData.deliveryType,
        slot_id: validatedData.slotId,
        address: validatedData.address,
        city: validatedData.city,
        zip: validatedData.zip,
        subtotal_cents: totals.subtotalCents,
        discount_cents: totals.discountCents,
        delivery_fee_cents: totals.deliveryFeeCents,
        total_cents: totals.totalCents,
        payment_method: validatedData.paymentMethod,
        payment_communication: paymentCommunication,
        notes: validatedData.notes || null,
        rgpd_consent: validatedData.rgpdConsent,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Erreur création commande:', orderError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la commande' },
        { status: 500 }
      )
    }

    // 10. Créer les lignes de commande
    const orderItems = validatedData.items.map((item) => ({
      order_id: order.id,
      product_id: item.cuveeId,
      qty: item.qty,
      unit_price_cents: item.unitPriceCents,
      line_total_cents: item.qty * item.unitPriceCents,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Erreur création lignes commande:', itemsError)
      // Rollback
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la commande' },
        { status: 500 }
      )
    }

    // 11. TODO: Envoyer les emails
    // await sendOrderConfirmationEmail(order, event, products)

    // 12. Retourner la commande
    return NextResponse.json(
      {
        success: true,
        order: {
          code: order.code,
          id: order.id,
          payment_communication: order.payment_communication,
          iban: config.payment_iban_override || event.section.iban,
          iban_name: config.payment_iban_name_override || event.section.iban_name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur création commande:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création de la commande' },
      { status: 500 }
    )
  }
}

/**
 * Génère une communication de virement lisible
 * Format: "NOM Prénom - Nom événement court"
 */
function generatePaymentCommunication(customerName: string, eventName: string): string {
  // Extraire nom et prénom
  const nameParts = customerName.trim().split(/\s+/)
  const lastName = nameParts[0] || ''
  const firstName = nameParts[1] || ''

  // Raccourcir le nom de l'événement
  const shortEventName = eventName
    .replace(/Vente de /gi, '')
    .replace(/Souper /gi, '')
    .replace(/Tombola /gi, '')
    .replace(/\d{4}/g, (year) => year.slice(2)) // 2024 → 24
    .trim()

  return `${lastName} ${firstName} - ${shortEventName}`.trim()
}
