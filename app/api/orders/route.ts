import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createOrderSchema } from '@/lib/validators'
import { calculateOrderTotals, meetsDeliveryMinimum, validateStock } from '@/lib/calculations'
import { generateOrderCode } from '@/lib/utils'
import { sendOrderConfirmation, OrderConfirmationData } from '@/lib/emails'
import { z } from 'zod'

/**
 * POST /api/orders (Multi-événements avec codes promo)
 * Crée une nouvelle commande pour un événement spécifique
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[POST /api/orders] Starting order creation')
    const body = await request.json()
    console.log('[POST /api/orders] Body received:', { eventId: body.eventId, itemCount: body.items?.length })

    // Valider l'eventId séparément car createOrderSchema utilise .refine() et ne peut pas être étendu
    const eventId = z.string().uuid('ID d\'événement invalide').parse(body.eventId)
    const validatedData = createOrderSchema.parse(body)
    console.log('[POST /api/orders] Data validated')

    const supabase = createServerClient() as any

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
      .eq('id', eventId)
      .eq('status', 'ACTIVE')
      .single()

    if (eventError || !event) {
      console.error('[POST /api/orders] Event not found:', eventError)
      return NextResponse.json(
        { error: 'Événement introuvable ou non actif' },
        { status: 404 }
      )
    }

    console.log('[POST /api/orders] Event found:', event.id)

    // Vérifier la période de vente
    const today = new Date().toISOString().split('T')[0]
    if (today < event.start_date || today > event.end_date) {
      console.log('[POST /api/orders] Event period invalid:', { today, start: event.start_date, end: event.end_date })
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
      console.error('[POST /api/orders] Error fetching products:', productsError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des produits' },
        { status: 500 }
      )
    }

    console.log('[POST /api/orders] Products fetched:', products.length)
    console.log('[POST /api/orders] Product IDs requested:', productIds)
    console.log('[POST /api/orders] Product IDs found:', products.map(p => p.id))

    // Valider que tous les produits existent et sont actifs
    const productMap = new Map(products.map((p) => [p.id, p]))

    for (const item of validatedData.items) {
      const product = productMap.get(item.cuveeId)
      if (!product || !product.is_active) {
        console.error('[POST /api/orders] Product not found or inactive:', item.cuveeId)
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

    // 6. Valider le code promo si fourni
    let promoCodeData: { id: string; code: string; discountCents: number } | null = null

    if (validatedData.promoCode) {
      const { data: promoCode, error: promoError } = await supabase
        .from('promo_codes')
        .select('id, code, discount_cents, is_active')
        .ilike('code', validatedData.promoCode.trim())
        .maybeSingle()

      if (promoError) {
        console.error('Erreur validation code promo:', promoError)
        return NextResponse.json(
          { error: 'Erreur lors de la validation du code promo' },
          { status: 500 }
        )
      }

      if (!promoCode || !promoCode.is_active) {
        return NextResponse.json(
          { error: 'Code promo invalide ou inactif' },
          { status: 400 }
        )
      }

      promoCodeData = {
        id: promoCode.id,
        code: promoCode.code,
        discountCents: promoCode.discount_cents,
      }
    }

    // 7. Calculer les totaux
    const deliveryFee = validatedData.deliveryType === 'DELIVERY' ? deliveryFeeCents : 0
    const totals = calculateOrderTotals(validatedData.items, discount10for9, deliveryFee)

    // Appliquer la réduction promo
    const promoDiscountCents = promoCodeData ? promoCodeData.discountCents : 0
    const finalTotal = Math.max(0, totals.totalCents - promoDiscountCents)

    // 8. Générer le code de commande
    const year = new Date().getFullYear()
    const prefix = config.order_code_prefix || 'ORD'

    // Compter les commandes de cet événement pour le numéro
    const { count: eventOrderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id)

    const orderNumber = (eventOrderCount || 0) + 1
    const orderCode = `${prefix}-${year}-${orderNumber.toString().padStart(5, '0')}`

    // 9. Générer la communication de virement
    const paymentCommunication = generatePaymentCommunication(
      validatedData.customerName,
      event.name
    )

    // 10. Créer la commande
    console.log('[POST /api/orders] Creating order with code:', orderCode)
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
        promo_code_id: promoCodeData?.id || null,
        promo_code: promoCodeData?.code || null,
        promo_discount_cents: promoDiscountCents,
        total_cents: finalTotal,
        payment_method: validatedData.paymentMethod,
        payment_communication: paymentCommunication,
        notes: validatedData.notes || null,
        rgpd_consent: validatedData.rgpdConsent,
      })
      .select()
      .single()

    if (orderError) {
      console.error('[POST /api/orders] Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la commande' },
        { status: 500 }
      )
    }

    console.log('[POST /api/orders] Order created:', order.id)

    // 11. Créer les lignes de commande
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
      console.error('[POST /api/orders] Error creating order items:', itemsError)
      // Rollback
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la commande' },
        { status: 500 }
      )
    }

    console.log('[POST /api/orders] Order items created')

    // 12. Préparer et envoyer l'email de confirmation
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const confirmationUrl = `${baseUrl}/merci/${order.code}`

    // Récupérer les informations du slot si applicable
    let slotInfo: { date: string; time: string } | null = null
    if (validatedData.slotId) {
      const { data: slot } = await supabase
        .from('slots')
        .select('date, start_time, end_time')
        .eq('id', validatedData.slotId)
        .single()

      if (slot) {
        const formatDate = (dateStr: string) => {
          const date = new Date(dateStr)
          return date.toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })
        }
        slotInfo = {
          date: formatDate(slot.date),
          time: `${slot.start_time} - ${slot.end_time}`,
        }
      }
    }

    // Préparer l'adresse complète pour la livraison
    let fullAddress: string | undefined
    if (validatedData.deliveryType === 'DELIVERY' && validatedData.address) {
      fullAddress = `${validatedData.address}, ${validatedData.zip} ${validatedData.city}`
    }

    // Préparer les données de l'email
    const emailData: OrderConfirmationData = {
      orderCode: order.code,
      customerName: validatedData.customerName,
      customerEmail: validatedData.email,
      eventName: event.name,
      sectionName: event.section.name || 'Notre section',
      sectionColor: config.primary_color || '#f59e0b',
      totalCents: finalTotal,
      items: validatedData.items.map(item => {
        const product = productMap.get(item.cuveeId)!
        return {
          name: product.name,
          quantity: item.qty,
          unitPriceCents: item.unitPriceCents,
        }
      }),
      deliveryType: validatedData.deliveryType,
      deliveryAddress: fullAddress,
      slotDate: slotInfo?.date,
      slotTime: slotInfo?.time,
      paymentMethod: validatedData.paymentMethod,
      paymentCommunication: order.payment_communication,
      iban: config.payment_iban_override || event.section.iban,
      ibanName: config.payment_iban_name_override || event.section.iban_name,
      discount: totals.discountCents,
      confirmationUrl,
    }

    // Envoyer l'email (de manière asynchrone sans bloquer la réponse)
    sendOrderConfirmation(emailData).catch((error) => {
      console.error('Erreur envoi email confirmation:', error)
      // Ne pas bloquer la création de commande si l'email échoue
    })

    // 13. Retourner la commande
    console.log('[POST /api/orders] Order creation completed successfully')
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
      console.error('[POST /api/orders] Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[POST /api/orders] Unexpected error:', error)
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
