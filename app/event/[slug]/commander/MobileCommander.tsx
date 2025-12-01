'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Truck, MapPin, Home, Calendar, Clock, User, CreditCard, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/contexts/ToastContext'

// Components
import MobileStepIndicator, { defaultMobileSteps, MobileStep } from './components/MobileStepIndicator'
import MobileStickyFooter from './components/MobileStickyFooter'
import MobileProductCard from './components/MobileProductCard'
import ProductDetailsModal from './components/ProductDetailsModal'

// Hooks
import { mobileInputClasses } from './hooks/useMobileInput'

// Phone formatting is done server-side after validation

// Types
interface Product {
  id: string
  name: string
  description: string
  price_cents: number
  product_type: string
  stock: number | null
  image_url: string | null
  allergens?: string[]
  is_vegetarian?: boolean
  is_vegan?: boolean
}

interface Slot {
  id: string
  date: string
  start_time: string
  end_time: string
  remainingCapacity: number
  capacity: number
  isFull: boolean
}

interface OrderFormData {
  deliveryType: 'PICKUP' | 'DELIVERY' | 'ON_SITE'
  slotId?: string
  customerName: string
  email: string
  phone: string
  address?: string
  zip?: string
  city?: string
  notes?: string
  paymentMethod: 'BANK_TRANSFER' | 'ON_SITE'
  rgpdConsent: boolean
}

interface Event {
  id: string
  slug: string
  name: string
  event_type: string
  config: {
    delivery_enabled: boolean
    delivery_min_bottles: number
    delivery_fee_cents: number
    allowed_zip_codes: string[]
    discount_10for9: boolean
    pickup_address?: string
    payment_iban_override?: string | null
    payment_iban_name_override?: string | null
  }
  section: {
    id: string
    name: string
    color: string
    iban: string
    iban_name: string
  }
  products: Product[]
  slots: Slot[]
}

export default function MobileCommander() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { addToast } = useToast()

  // States
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<Partial<OrderFormData>>({})
  const [expandedDate, setExpandedDate] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Promo code states
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountCents: number } | null>(null)
  const [promoError, setPromoError] = useState('')
  const [validatingPromo, setValidatingPromo] = useState(false)

  // Load event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${slug}`)
        if (!res.ok) throw new Error('Event not found')
        const data = await res.json()
        setEvent(data.event)
      } catch (error) {
        console.error('Error loading event:', error)
        addToast('Erreur de chargement de l\'événement', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [slug, addToast])

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${slug}`)
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        setCart(parsed)
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }
  }, [slug])

  // Save cart to localStorage
  useEffect(() => {
    if (Object.keys(cart).length > 0) {
      localStorage.setItem(`cart_${slug}`, JSON.stringify(cart))
    } else {
      localStorage.removeItem(`cart_${slug}`)
    }
  }, [cart, slug])

  // Handlers
  const handleQuantityChange = (productId: string, qty: number) => {
    setCart(prev => {
      if (qty === 0) {
        const newCart = { ...prev }
        delete newCart[productId]
        return newCart
      }
      return { ...prev, [productId]: qty }
    })
  }

  const handleShowDetails = (product: Product) => {
    setModalProduct(product)
  }

  const handleCloseModal = () => {
    setModalProduct(null)
  }

  const handleAddToCart = (qty: number) => {
    if (modalProduct) {
      handleQuantityChange(modalProduct.id, qty)
    }
  }

  // Promo code functions
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Veuillez entrer un code promo')
      return
    }

    setValidatingPromo(true)
    setPromoError('')

    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim() }),
      })

      const result = await response.json()

      if (result.valid && result.promoCode) {
        setAppliedPromo({
          code: result.promoCode.code,
          discountCents: result.promoCode.discountCents,
        })
        addToast(`Code promo "${result.promoCode.code}" appliqué !`, 'success')
        setPromoCode('')
      } else {
        setPromoError(result.error || 'Code promo invalide')
        setAppliedPromo(null)
      }
    } catch (error) {
      console.error('Error validating promo code:', error)
      setPromoError('Erreur lors de la validation du code')
      setAppliedPromo(null)
    } finally {
      setValidatingPromo(false)
    }
  }

  const removePromoCode = () => {
    setAppliedPromo(null)
    setPromoCode('')
    setPromoError('')
    addToast('Code promo retiré', 'info')
  }

  const handleContinue = () => {
    // Step 0: Products validation
    if (currentStep === 0) {
      if (totalItems === 0) {
        addToast('Veuillez ajouter au moins un produit', 'error')
        return
      }
      setCurrentStep(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Step 1: Delivery type validation
    if (currentStep === 1) {
      if (!formData.deliveryType) {
        addToast('Veuillez sélectionner un mode de récupération', 'error')
        return
      }
      // Check if we need to skip slot selection step
      const needsSlot = event?.slots && event.slots.length > 0 &&
                        (formData.deliveryType === 'PICKUP' || formData.deliveryType === 'ON_SITE')
      if (!needsSlot) {
        setCurrentStep(3) // Skip to contact info
      } else {
        setCurrentStep(2) // Go to slot selection
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Step 2: Slot selection validation
    if (currentStep === 2) {
      const needsSlot = event?.slots && event.slots.length > 0 &&
                        (formData.deliveryType === 'PICKUP' || formData.deliveryType === 'ON_SITE')
      if (needsSlot && !formData.slotId) {
        addToast('Veuillez sélectionner un créneau', 'error')
        return
      }
      setCurrentStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Step 3: Contact info validation
    if (currentStep === 3) {
      if (!formData.customerName || !formData.email || !formData.phone) {
        addToast('Veuillez remplir tous les champs obligatoires', 'error')
        return
      }
      if (formData.deliveryType === 'DELIVERY' && (!formData.address || !formData.zip || !formData.city)) {
        addToast('Veuillez remplir l\'adresse de livraison', 'error')
        return
      }
      setCurrentStep(4)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Step 4: Payment method validation
    if (currentStep === 4) {
      if (!formData.paymentMethod) {
        addToast('Veuillez sélectionner un mode de paiement', 'error')
        return
      }
      setCurrentStep(5)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      const needsSlot = event?.slots && event.slots.length > 0 &&
                        (formData.deliveryType === 'PICKUP' || formData.deliveryType === 'ON_SITE')

      // Skip slot selection step when going back if not applicable
      if (currentStep === 3 && !needsSlot) {
        setCurrentStep(1) // Go back to delivery type
      } else {
        setCurrentStep(prev => prev - 1)
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmitOrder = async () => {
    if (!formData.rgpdConsent) {
      addToast('Veuillez accepter les conditions RGPD', 'error')
      return
    }

    setSubmitting(true)
    try {
      // Transform cart to items array
      const items = Object.entries(cart).map(([productId, qty]) => {
        const product = event!.products.find(p => p.id === productId)
        return {
          cuveeId: productId,
          qty,
          unitPriceCents: product!.price_cents,
        }
      })

      const orderData = {
        eventId: event?.id,
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone, // Will be formatted server-side after validation
        notes: formData.notes || undefined,
        deliveryType: formData.deliveryType,
        slotId: formData.slotId || null,
        address: formData.address || null,
        city: formData.city || null,
        zip: formData.zip || null,
        paymentMethod: formData.paymentMethod,
        items,
        rgpdConsent: formData.rgpdConsent,
        promoCode: appliedPromo?.code,
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Order submission failed')
      }

      const data = await res.json()

      // Clear cart from localStorage
      localStorage.removeItem(`cart_${slug}`)

      addToast('Commande confirmée !', 'success')
      router.push(`/merci/${data.order.code}`)
    } catch (error) {
      console.error('Error submitting order:', error)
      addToast(error instanceof Error ? error.message : 'Erreur lors de la soumission de la commande', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date)
  }

  const formatPrice = (cents: number): string => {
    return `${(cents / 100).toFixed(2)} €`
  }

  // Group slots by date
  const slotsByDate = event?.slots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = []
    }
    acc[slot.date].push(slot)
    return acc
  }, {} as Record<string, Slot[]>) || {}

  const sortedDates = Object.keys(slotsByDate).sort()

  // Calculations
  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  const subtotalCents = event
    ? Object.entries(cart).reduce((sum, [productId, qty]) => {
        const product = event.products.find(p => p.id === productId)
        return sum + (product ? product.price_cents * qty : 0)
      }, 0)
    : 0

  // Calculate discount (10 for 9 if enabled)
  let discountCents = 0
  if (event?.config.discount_10for9 && totalItems >= 10) {
    const freeBottles = Math.floor(totalItems / 10)
    if (freeBottles > 0 && subtotalCents > 0) {
      const avgPrice = subtotalCents / totalItems
      const rawDiscount = freeBottles * avgPrice
      discountCents = Math.round(rawDiscount / 100) * 100
    }
  }

  const deliveryFeeCents = formData.deliveryType === 'DELIVERY' && event ? event.config.delivery_fee_cents : 0
  const promoDiscountCents = appliedPromo ? appliedPromo.discountCents : 0
  const totalCents = Math.max(0, subtotalCents - discountCents + deliveryFeeCents - promoDiscountCents)

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  // Error state
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Événement introuvable
          </h1>
          <Link href="/">
            <button className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold active:scale-95 transition-transform">
              Retour à l'accueil
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4">
          {currentStep === 0 ? (
            <Link
              href={`/event/${slug}`}
              className="inline-flex items-center gap-2 text-gray-600 active:text-amber-700 transition-colors mb-3"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour</span>
            </Link>
          ) : (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-gray-600 active:text-amber-700 transition-colors mb-3"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour</span>
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-900">{event.name}</h1>
        </div>
      </div>

      {/* Step Indicator */}
      <MobileStepIndicator
        currentStep={currentStep}
        totalSteps={defaultMobileSteps.length}
        steps={defaultMobileSteps}
      />

      {/* Content */}
      <main className="px-4 py-6">
        {/* Step 1: Products Selection */}
        {currentStep === 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Sélectionnez vos produits
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Ajoutez les articles que vous souhaitez commander
            </p>

            {/* Products List */}
            <div className="space-y-3">
              {event.products
                .filter(p => p.product_type !== 'ADDON')
                .map((product) => (
                  <MobileProductCard
                    key={product.id}
                    product={product}
                    quantity={cart[product.id] || 0}
                    onQuantityChange={(qty) => handleQuantityChange(product.id, qty)}
                    onShowDetails={() => handleShowDetails(product)}
                  />
                ))}
            </div>

            {/* Empty state */}
            {event.products.filter(p => p.product_type !== 'ADDON').length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun produit disponible</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Delivery Type */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Mode de récupération
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Comment souhaitez-vous recevoir votre commande ?
            </p>

            <div className="space-y-3">
              {/* PICKUP */}
              {(event.event_type === 'PRODUCT_SALE' || event.event_type === 'RAFFLE') && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'PICKUP' }))}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    formData.deliveryType === 'PICKUP'
                      ? 'border-amber-500 bg-amber-50 shadow-md'
                      : 'border-gray-200 bg-white active:border-amber-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      formData.deliveryType === 'PICKUP' ? 'bg-amber-600' : 'bg-gray-100'
                    }`}>
                      <MapPin className={`w-5 h-5 ${
                        formData.deliveryType === 'PICKUP' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">Retrait sur place</p>
                      {event.config.pickup_address && (
                        <p className="text-sm text-gray-600">{event.config.pickup_address}</p>
                      )}
                      {formData.deliveryType === 'PICKUP' && (
                        <span className="inline-block mt-2 text-xs bg-amber-600 text-white px-2 py-1 rounded-full font-semibold">
                          ✓ Sélectionné
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )}

              {/* DELIVERY */}
              {event.config.delivery_enabled && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'DELIVERY' }))}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    formData.deliveryType === 'DELIVERY'
                      ? 'border-amber-500 bg-amber-50 shadow-md'
                      : 'border-gray-200 bg-white active:border-amber-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      formData.deliveryType === 'DELIVERY' ? 'bg-amber-600' : 'bg-gray-100'
                    }`}>
                      <Truck className={`w-5 h-5 ${
                        formData.deliveryType === 'DELIVERY' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">Livraison à domicile</p>
                      {event.config.delivery_fee_cents > 0 && (
                        <p className="text-sm text-amber-600 font-medium">
                          Frais de livraison: {formatPrice(event.config.delivery_fee_cents)}
                        </p>
                      )}
                      {event.config.delivery_min_bottles > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum {event.config.delivery_min_bottles} bouteilles
                        </p>
                      )}
                      {formData.deliveryType === 'DELIVERY' && (
                        <span className="inline-block mt-2 text-xs bg-amber-600 text-white px-2 py-1 rounded-full font-semibold">
                          ✓ Sélectionné
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )}

              {/* ON_SITE */}
              {event.event_type === 'MEAL' && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'ON_SITE' }))}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    formData.deliveryType === 'ON_SITE'
                      ? 'border-amber-500 bg-amber-50 shadow-md'
                      : 'border-gray-200 bg-white active:border-amber-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      formData.deliveryType === 'ON_SITE' ? 'bg-amber-600' : 'bg-gray-100'
                    }`}>
                      <Home className={`w-5 h-5 ${
                        formData.deliveryType === 'ON_SITE' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">Sur place</p>
                      <p className="text-sm text-gray-600">
                        Consommation sur place le jour de l'événement
                      </p>
                      {formData.deliveryType === 'ON_SITE' && (
                        <span className="inline-block mt-2 text-xs bg-amber-600 text-white px-2 py-1 rounded-full font-semibold">
                          ✓ Sélectionné
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Slot Selection */}
        {currentStep === 2 && event.slots && event.slots.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Choisissez un créneau
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Sélectionnez le créneau qui vous convient
            </p>

            <div className="space-y-3">
              {sortedDates.map((date) => {
                const dateSlots = slotsByDate[date]
                const isExpanded = expandedDate === date
                const selectedSlot = dateSlots.find(slot => slot.id === formData.slotId)

                return (
                  <div
                    key={date}
                    className={`border-2 rounded-xl overflow-hidden transition-all ${
                      selectedSlot ? 'border-amber-500 shadow-md' : 'border-gray-200'
                    }`}
                  >
                    {/* Date Header */}
                    <button
                      type="button"
                      onClick={() => setExpandedDate(isExpanded ? null : date)}
                      className={`w-full px-4 py-3 flex items-center gap-3 ${
                        selectedSlot ? 'bg-amber-50' : 'bg-white active:bg-gray-50'
                      }`}
                    >
                      <Calendar className={`w-5 h-5 ${selectedSlot ? 'text-amber-600' : 'text-gray-600'}`} />
                      <div className="flex-1 text-left">
                        <p className="font-bold text-gray-900 text-sm">
                          {formatDate(date)}
                        </p>
                        {selectedSlot && (
                          <p className="text-xs text-amber-700 font-medium mt-0.5">
                            {selectedSlot.start_time} - {selectedSlot.end_time}
                          </p>
                        )}
                      </div>
                      {selectedSlot && (
                        <span className="text-xs bg-amber-600 text-white px-2 py-1 rounded-full font-semibold">
                          ✓
                        </span>
                      )}
                    </button>

                    {/* Slots List */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50 p-3 space-y-2">
                        {dateSlots.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, slotId: slot.id }))}
                            disabled={slot.isFull}
                            className={`w-full p-3 rounded-lg text-left transition-all ${
                              slot.isFull
                                ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                                : formData.slotId === slot.id
                                ? 'bg-amber-100 border-2 border-amber-500'
                                : 'bg-white border border-gray-200 active:border-amber-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-600" />
                                <span className="font-semibold text-gray-900 text-sm">
                                  {slot.start_time} - {slot.end_time}
                                </span>
                              </div>
                              {slot.isFull && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                                  Complet
                                </span>
                              )}
                              {formData.slotId === slot.id && !slot.isFull && (
                                <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full font-semibold">
                                  ✓
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Places disponibles</span>
                              <span className={`font-bold ${slot.isFull ? 'text-gray-500' : 'text-amber-600'}`}>
                                {slot.remainingCapacity} / {slot.capacity}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 4: Contact Information */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Vos coordonnées
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Pour confirmer votre commande
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  className={mobileInputClasses}
                  placeholder="Jean Dupont"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  inputMode="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={mobileInputClasses}
                  placeholder="jean.dupont@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className={mobileInputClasses}
                  placeholder="+32 123 45 67 89"
                  autoComplete="tel"
                />
              </div>

              {/* Delivery Address */}
              {formData.deliveryType === 'DELIVERY' && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Adresse de livraison
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Adresse <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.address || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className={mobileInputClasses}
                        placeholder="Rue de la Paix, 123"
                        autoComplete="street-address"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Code postal <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formData.zip || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                          className={mobileInputClasses}
                          placeholder="1000"
                          autoComplete="postal-code"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Ville <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.city || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          className={mobileInputClasses}
                          placeholder="Bruxelles"
                          autoComplete="address-level2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notes et remarques (optionnel)
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Allergies, demandes spéciales..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Payment Method */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Mode de paiement
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Comment souhaitez-vous payer ?
            </p>

            <div className="space-y-3">
              {/* Bank Transfer */}
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'BANK_TRANSFER' }))}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  formData.paymentMethod === 'BANK_TRANSFER'
                    ? 'border-amber-500 bg-amber-50 shadow-md'
                    : 'border-gray-200 bg-white active:border-amber-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    formData.paymentMethod === 'BANK_TRANSFER' ? 'bg-amber-600' : 'bg-gray-100'
                  }`}>
                    <CreditCard className={`w-5 h-5 ${
                      formData.paymentMethod === 'BANK_TRANSFER' ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1">Virement bancaire</p>
                    <p className="text-sm text-gray-600">
                      Vous recevrez les coordonnées bancaires par email
                    </p>
                    {formData.paymentMethod === 'BANK_TRANSFER' && (
                      <span className="inline-block mt-2 text-xs bg-amber-600 text-white px-2 py-1 rounded-full font-semibold">
                        ✓ Sélectionné
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* On-Site Payment */}
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'ON_SITE' }))}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  formData.paymentMethod === 'ON_SITE'
                    ? 'border-amber-500 bg-amber-50 shadow-md'
                    : 'border-gray-200 bg-white active:border-amber-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    formData.paymentMethod === 'ON_SITE' ? 'bg-amber-600' : 'bg-gray-100'
                  }`}>
                    <CreditCard className={`w-5 h-5 ${
                      formData.paymentMethod === 'ON_SITE' ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1">Paiement sur place</p>
                    <p className="text-sm text-gray-600">
                      Payez lors du retrait ou de la livraison
                    </p>
                    {formData.paymentMethod === 'ON_SITE' && (
                      <span className="inline-block mt-2 text-xs bg-amber-600 text-white px-2 py-1 rounded-full font-semibold">
                        ✓ Sélectionné
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* Promo Code Section */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Code promo</h3>

              {appliedPromo ? (
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border-2 border-green-500">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-green-700 text-sm">{appliedPromo.code}</p>
                      <p className="text-xs text-gray-600">
                        Réduction de {(appliedPromo.discountCents / 100).toFixed(2)} €
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removePromoCode}
                    className="text-red-600 hover:text-red-700 font-medium text-xs px-2 py-1"
                  >
                    Retirer
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase())
                        setPromoError('')
                      }}
                      placeholder="Entrez votre code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      disabled={validatingPromo}
                    />
                    <button
                      type="button"
                      onClick={applyPromoCode}
                      disabled={!promoCode.trim() || validatingPromo}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
                    >
                      {validatingPromo ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Appliquer'
                      )}
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-red-600">{promoError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 6: Confirmation */}
        {currentStep === 5 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Confirmation
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Vérifiez votre commande avant de confirmer
            </p>

            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <h3 className="font-bold text-gray-900 mb-3">Récapitulatif</h3>

              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                {Object.entries(cart).map(([productId, qty]) => {
                  const product = event.products.find(p => p.id === productId)
                  if (!product) return null
                  return (
                    <div key={productId} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {product.name} <span className="text-gray-500">× {qty}</span>
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(product.price_cents * qty)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-semibold">{formatPrice(subtotalCents)}</span>
                </div>

                {discountCents > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Remise 10 pour 9</span>
                    <span className="font-semibold">-{formatPrice(discountCents)}</span>
                  </div>
                )}

                {deliveryFeeCents > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span className="font-semibold">{formatPrice(deliveryFeeCents)}</span>
                  </div>
                )}

                {promoDiscountCents > 0 && (
                  <div className="flex justify-between text-sm text-amber-600">
                    <span>Code promo {appliedPromo?.code}</span>
                    <span className="font-semibold">-{formatPrice(promoDiscountCents)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-amber-700">
                    {formatPrice(totalCents)}
                  </span>
                </div>
              </div>
            </div>

            {/* RGPD Consent */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rgpdConsent || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, rgpdConsent: e.target.checked }))}
                  className="mt-1 w-5 h-5 text-amber-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  J'accepte que mes données personnelles soient utilisées pour traiter ma commande conformément au RGPD
                </span>
              </label>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Footer avec panier */}
      <MobileStickyFooter
        totalCents={totalCents}
        itemCount={totalItems}
        buttonLabel={
          currentStep === 5
            ? 'Confirmer la commande'
            : currentStep === 0
            ? 'Continuer'
            : 'Étape suivante'
        }
        buttonDisabled={
          (currentStep === 0 && totalItems === 0) ||
          (currentStep === 5 && !formData.rgpdConsent)
        }
        onButtonClick={currentStep === 5 ? handleSubmitOrder : handleContinue}
        isLoading={submitting}
        additionalInfo={
          currentStep === 0 && totalItems > 0
            ? `${totalItems} article${totalItems > 1 ? 's' : ''} dans le panier`
            : (deliveryFeeCents > 0 || promoDiscountCents > 0 || discountCents > 0)
            ? [
                deliveryFeeCents > 0 && `+ ${formatPrice(deliveryFeeCents)} livraison`,
                discountCents > 0 && `- ${formatPrice(discountCents)} remise`,
                promoDiscountCents > 0 && `- ${formatPrice(promoDiscountCents)} promo`
              ].filter(Boolean).join(' • ')
            : undefined
        }
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={modalProduct}
        isOpen={modalProduct !== null}
        onClose={handleCloseModal}
        quantity={modalProduct ? cart[modalProduct.id] || 0 : 0}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}
