'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, ShoppingCart, Truck, Calendar, User, CreditCard, CheckCircle, ChevronDown, Clock, Users as UsersIcon } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PaymentMethodsBadge from '@/components/payment/PaymentMethodsBadge'
import StepBar, { Step } from '@/components/ui/StepBar'
import { useToast } from '@/contexts/ToastContext'
import { useDeviceDetection } from './hooks/useDeviceDetection'
import MobileCommander from './MobileCommander'
import ProductDetailsModal from './components/ProductDetailsModal'
import MobileProductCard from './components/MobileProductCard'

// Helper function to get allergen label in French
const getAllergenLabel = (allergenCode: string): string => {
  const allergenLabels: Record<string, string> = {
    gluten: 'Gluten',
    lactose: 'Lactose',
    oeufs: 'Œufs',
    poisson: 'Poisson',
    crustaces: 'Crustacés',
    fruits_a_coque: 'Fruits à coque',
    arachides: 'Arachides',
    soja: 'Soja',
    celeri: 'Céleri',
    moutarde: 'Moutarde',
    sesame: 'Sésame',
    sulfites: 'Sulfites',
    lupin: 'Lupin',
    mollusques: 'Mollusques',
  }
  return allergenLabels[allergenCode] || allergenCode
}

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
  isFull: boolean
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

// Validation schema
const orderSchema = z.object({
  customerName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(9, 'Téléphone invalide'),
  deliveryType: z.enum(['PICKUP', 'DELIVERY', 'ON_SITE']),
  slotId: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  paymentMethod: z.enum(['BANK_TRANSFER', 'ON_SITE']),
  notes: z.string().optional(),
  rgpdConsent: z.boolean().refine(val => val === true, 'Vous devez accepter'),
})

type OrderFormData = z.infer<typeof orderSchema>

export default function CommanderPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { addToast } = useToast()
  const isMobile = useDeviceDetection()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [expandedDates, setExpandedDates] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Promo code states
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountCents: number } | null>(null)
  const [promoError, setPromoError] = useState('')
  const [validatingPromo, setValidatingPromo] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${slug}`)
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        setCart(parsed)
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [slug])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(cart).length > 0) {
      localStorage.setItem(`cart_${slug}`, JSON.stringify(cart))
    } else {
      localStorage.removeItem(`cart_${slug}`)
    }
  }, [cart, slug])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      deliveryType: 'PICKUP',
      paymentMethod: 'BANK_TRANSFER',
      rgpdConsent: false,
    },
  })

  const deliveryType = watch('deliveryType')
  const watchedSlotId = watch('slotId')

  // Check if slot is needed
  const needsSlot = (deliveryType === 'PICKUP' || deliveryType === 'ON_SITE') && event && event.slots.length > 0

  // Define all steps dynamically based on event configuration
  const allSteps: Step[] = [
    {
      id: 'products',
      label: 'Produits',
      description: 'Sélectionnez vos articles',
      icon: ShoppingCart,
    },
    {
      id: 'delivery',
      label: 'Récupération',
      description: 'Mode de retrait',
      icon: Truck,
    },
    ...(needsSlot ? [{
      id: 'slot',
      label: 'Créneau',
      description: 'Choisissez une date',
      icon: Calendar,
    }] : []),
    {
      id: 'contact',
      label: 'Coordonnées',
      description: 'Vos informations',
      icon: User,
    },
    {
      id: 'payment',
      label: 'Paiement',
      description: 'Mode de paiement',
      icon: CreditCard,
    },
    {
      id: 'confirm',
      label: 'Confirmation',
      description: 'Vérifiez et validez',
      icon: CheckCircle,
    },
  ]

  // Calculate completed steps (all steps before current)
  const completedSteps = Array.from({ length: currentStepIndex }, (_, i) => i)

  // Group slots by date for accordion display
  const slotsByDate = useMemo(() => {
    if (!event || !event.slots) return {}

    const grouped = event.slots.reduce(
      (acc, slot) => {
        if (!acc[slot.date]) {
          acc[slot.date] = []
        }
        acc[slot.date].push(slot)
        return acc
      },
      {} as Record<string, Slot[]>
    )

    // Sort each group by start time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => a.start_time.localeCompare(b.start_time))
    })

    return grouped
  }, [event])

  const sortedDates = useMemo(() => {
    return Object.keys(slotsByDate).sort((a, b) => a.localeCompare(b))
  }, [slotsByDate])

  const toggleDate = (date: string) => {
    setExpandedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    )
  }

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-BE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Get stats for a date
  const getDateStats = (dateSlots: Slot[]) => {
    const totalSlots = dateSlots.length
    const availableSlots = dateSlots.filter((s) => !s.isFull).length
    const totalCapacity = dateSlots.reduce((sum, s) => sum + (s.capacity || 0), 0)
    const remainingCapacity = dateSlots.reduce((sum, s) => sum + (s.remainingCapacity || 0), 0)

    return {
      totalSlots,
      availableSlots,
      totalCapacity,
      remainingCapacity,
    }
  }

  // Validation functions for each step
  const validateStep = (stepIndex: number): boolean => {
    const step = allSteps[stepIndex]

    switch (step.id) {
      case 'products':
        if (Object.keys(cart).length === 0) {
          addToast('Veuillez sélectionner au moins un produit', 'error')
          return false
        }
        return true

      case 'delivery':
        if (!deliveryType) {
          addToast('Veuillez choisir un mode de récupération', 'error')
          return false
        }
        return true

      case 'slot':
        if (!watchedSlotId) {
          addToast('Veuillez sélectionner un créneau', 'error')
          return false
        }
        return true

      case 'contact':
        const name = watch('customerName')
        const email = watch('email')
        const phone = watch('phone')

        if (!name || name.length < 2) {
          addToast('Veuillez entrer un nom valide', 'error')
          return false
        }
        if (!email || !email.includes('@')) {
          addToast('Veuillez entrer un email valide', 'error')
          return false
        }
        if (!phone || phone.length < 9) {
          addToast('Veuillez entrer un numéro de téléphone valide', 'error')
          return false
        }

        // Validate delivery address if needed
        if (deliveryType === 'DELIVERY') {
          const address = watch('address')
          const city = watch('city')
          const zip = watch('zip')

          if (!address || !city || !zip) {
            addToast('Veuillez remplir l\'adresse de livraison complète', 'error')
            return false
          }
        }
        return true

      case 'payment':
        const paymentMethod = watch('paymentMethod')
        if (!paymentMethod) {
          addToast('Veuillez choisir un mode de paiement', 'error')
          return false
        }
        return true

      case 'confirm':
        const rgpd = watch('rgpdConsent')
        if (!rgpd) {
          addToast('Veuillez accepter la politique de confidentialité', 'error')
          return false
        }
        return true

      default:
        return true
    }
  }

  // Navigation functions
  const goToNextStep = () => {
    if (validateStep(currentStepIndex)) {
      if (currentStepIndex < allSteps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const canGoBack = currentStepIndex > 0
  const isLastStep = currentStepIndex === allSteps.length - 1

  // Check if current step is valid (can proceed to next)
  const isCurrentStepValid = (): boolean => {
    const step = allSteps[currentStepIndex]

    switch (step.id) {
      case 'products':
        return Object.keys(cart).length > 0

      case 'delivery':
        return !!deliveryType

      case 'slot':
        return !!watchedSlotId

      case 'contact':
        const name = watch('customerName')
        const email = watch('email')
        const phone = watch('phone')

        if (!name || name.length < 2 || !email || !email.includes('@') || !phone || phone.length < 9) {
          return false
        }

        // Validate delivery address if needed
        if (deliveryType === 'DELIVERY') {
          const address = watch('address')
          const city = watch('city')
          const zip = watch('zip')
          return !!(address && city && zip)
        }
        return true

      case 'payment':
        return !!watch('paymentMethod')

      case 'confirm':
        return !!watch('rgpdConsent')

      default:
        return true
    }
  }

  // Fetch event data
  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${slug}`)
        if (!res.ok) throw new Error('Event not found')
        const data = await res.json()
        setEvent(data.event)
      } catch (error) {
        console.error('Error fetching event:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [slug])

  // Cart functions
  const addToCart = (productId: string) => {
    if (!event) return

    const product = event.products.find(p => p.id === productId)
    if (!product) return

    // Check stock availability
    if (product.stock !== null && product.stock !== undefined) {
      const currentQty = cart[productId] || 0
      if (currentQty >= product.stock) {
        addToast('Stock insuffisant', 'error')
        return
      }
    }

    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newQty = (prev[productId] || 0) - 1
      if (newQty <= 0) {
        const { [productId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [productId]: newQty }
    })
  }

  const updateQuantity = (productId: string, qty: number) => {
    if (!event) return

    const product = event.products.find(p => p.id === productId)
    if (!product) return

    if (qty <= 0) {
      const { [productId]: _, ...rest } = cart
      setCart(rest)
    } else {
      // Check stock availability
      if (product.stock !== null && product.stock !== undefined) {
        if (qty > product.stock) {
          addToast(`Stock maximum: ${product.stock} bouteilles`, 'error')
          return
        }
      }
      setCart(prev => ({ ...prev, [productId]: qty }))
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

  // Calculate totals
  const calculateTotals = () => {
    if (!event) return { subtotal: 0, discount: 0, deliveryFee: 0, promoDiscount: 0, total: 0 }

    const subtotal = Object.entries(cart).reduce((sum, [productId, qty]) => {
      const product = event.products.find(p => p.id === productId)
      return sum + (product?.price_cents || 0) * qty
    }, 0)

    let discount = 0
    if (event.config.discount_10for9) {
      const totalQty = Object.values(cart).reduce((sum, qty) => sum + qty, 0)
      const freeBottles = Math.floor(totalQty / 10)
      if (freeBottles > 0 && subtotal > 0) {
        // Calculate discount based on average price and round to nearest 100 cents (1 euro)
        const avgPrice = subtotal / totalQty
        const rawDiscount = freeBottles * avgPrice
        // Round to nearest euro (100 cents)
        discount = Math.round(rawDiscount / 100) * 100
      }
    }

    const deliveryFee =
      deliveryType === 'DELIVERY' ? event.config.delivery_fee_cents : 0

    const promoDiscount = appliedPromo ? appliedPromo.discountCents : 0

    const total = Math.max(0, subtotal - discount + deliveryFee - promoDiscount)

    return { subtotal, discount, deliveryFee, promoDiscount, total }
  }

  const { subtotal, discount, deliveryFee, promoDiscount, total } = calculateTotals()
  const totalQty = Object.values(cart).reduce((sum, qty) => sum + qty, 0)

  // Form submission
  const onSubmit = async (data: OrderFormData) => {
    if (!event || Object.keys(cart).length === 0) return

    // Final validation of last step
    if (!validateStep(currentStepIndex)) {
      return
    }

    setSubmitting(true)

    // Refresh event data to get latest stock before submitting
    try {
      const refreshResponse = await fetch(`/api/events/${slug}`)
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        const latestEvent = refreshData.event

        // Validate stock availability with latest data
        for (const [productId, qty] of Object.entries(cart)) {
          const product = latestEvent.products.find((p: any) => p.id === productId)
          if (product && product.stock !== null && product.stock !== undefined) {
            if (qty > product.stock) {
              addToast(`Stock insuffisant pour ${product.name}. Quelqu'un a commandé entre temps. Stock actuel: ${product.stock}`, 'error')
              setSubmitting(false)
              // Refresh local event data
              setEvent(latestEvent)
              return
            }
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing stock:', error)
      // Continue anyway, the server will validate
    }

    try {
      const items = Object.entries(cart).map(([productId, qty]) => {
        const product = event.products.find(p => p.id === productId)
        return {
          cuveeId: productId,
          qty,
          unitPriceCents: product?.price_cents || 0,
        }
      })

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          ...data,
          items,
          promoCode: appliedPromo?.code,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        addToast(result.error || 'Erreur lors de la commande', 'error')
        return
      }

      // Clear cart from localStorage
      localStorage.removeItem(`cart_${slug}`)

      // Redirect to confirmation page
      addToast('Commande passée avec succès !', 'success')
      router.push(`/merci/${result.order.code}`)
    } catch (error) {
      console.error('Error submitting order:', error)
      addToast('Erreur lors de la commande', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Get current step info
  const currentStep = allSteps[currentStepIndex]

  // Si mobile, afficher le composant mobile dédié
  if (isMobile) {
    return <MobileCommander />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Événement introuvable
          </h1>
          <Link href="/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href={`/event/${slug}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour à l'événement</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
          <p className="mt-2 text-gray-600">
            Complétez votre commande en quelques étapes
          </p>
        </div>

        {/* Step Bar */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-6">
          <StepBar
            steps={allSteps}
            currentStep={currentStepIndex}
            completedSteps={completedSteps}
            orientation="horizontal"
            size="md"
            showDescription={true}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Current Step Content */}
          <div className="lg:col-span-2">

            {/* Step 1: Products Selection */}
            {currentStep.id === 'products' && (
              <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                  Sélectionnez vos produits
                </h2>

                {/* Products List using MobileProductCard component */}
                <div className="space-y-3">
                  {event.products.map(product => (
                    <MobileProductCard
                      key={product.id}
                      product={product}
                      quantity={cart[product.id] || 0}
                      onQuantityChange={(qty) => updateQuantity(product.id, qty)}
                      onShowDetails={() => setSelectedProduct(product)}
                    />
                  ))}
                </div>

                {event.config.discount_10for9 && (
                  <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-lg text-sm font-medium">
                    Remise spéciale : 10 bouteilles pour le prix de 9 !
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Delivery Type */}
            {currentStep.id === 'delivery' && (
              <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Truck className="w-6 h-6 text-amber-600" />
                  Mode de récupération
                </h2>

                <div className="space-y-4">
                  {(event.event_type === 'PRODUCT_SALE' || event.event_type === 'RAFFLE') && (
                    <label className="flex items-start gap-4 p-5 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 hover:shadow-md transition-all">
                      <input
                        type="radio"
                        value="PICKUP"
                        {...register('deliveryType')}
                        className="mt-1.5 w-5 h-5 text-amber-600"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-lg text-gray-900">Retrait sur place</p>
                        {event.config.pickup_address && (
                          <p className="text-sm text-gray-600 mt-1">
                            {event.config.pickup_address}
                          </p>
                        )}
                      </div>
                    </label>
                  )}

                  {event.config.delivery_enabled && (
                    <label className="flex items-start gap-4 p-5 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 hover:shadow-md transition-all">
                      <input
                        type="radio"
                        value="DELIVERY"
                        {...register('deliveryType')}
                        className="mt-1.5 w-5 h-5 text-amber-600"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-lg text-gray-900">Livraison à domicile</p>
                        {deliveryFee > 0 && (
                          <p className="text-sm text-amber-600 font-medium mt-1">
                            Frais de livraison: {(deliveryFee / 100).toFixed(2)} €
                          </p>
                        )}
                      </div>
                    </label>
                  )}

                  {event.event_type === 'MEAL' && (
                    <label className="flex items-start gap-4 p-5 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 hover:shadow-md transition-all">
                      <input
                        type="radio"
                        value="ON_SITE"
                        {...register('deliveryType')}
                        className="mt-1.5 w-5 h-5 text-amber-600"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-lg text-gray-900">Sur place</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Consommation sur place le jour de l'événement
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Slot Selection (conditional) */}
            {currentStep.id === 'slot' && (
              <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-amber-600" />
                  Choisissez un créneau
                </h2>

                <p className="text-gray-600 mb-6">
                  Sélectionnez le créneau qui vous convient pour récupérer votre commande
                </p>

                {/* Slots grouped by date - Accordion */}
                <div className="space-y-4">
                  {sortedDates.map((date) => {
                    const dateSlots = slotsByDate[date]
                    const isExpanded = expandedDates.includes(date)
                    const stats = getDateStats(dateSlots)

                    // Check if a slot from this date is selected
                    const selectedSlotInThisDate = dateSlots.find(slot => slot.id === watchedSlotId)
                    const hasSelectedSlot = !!selectedSlotInThisDate

                    return (
                      <div
                        key={date}
                        className={`border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                          hasSelectedSlot
                            ? 'border-amber-400 shadow-md'
                            : 'border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        {/* Date Header - Clickable */}
                        <button
                          type="button"
                          onClick={() => toggleDate(date)}
                          className={`w-full px-5 py-4 flex items-center gap-4 transition-colors ${
                            hasSelectedSlot ? 'bg-amber-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          {/* Chevron Icon */}
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${
                              hasSelectedSlot ? 'bg-amber-500' : 'bg-amber-100'
                            }`}
                            style={{
                              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                            }}
                          >
                            <ChevronDown className={`w-5 h-5 ${hasSelectedSlot ? 'text-white' : 'text-amber-600'}`} />
                          </div>

                          {/* Date Info */}
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-gray-900">
                                {formatDate(date)}
                              </h3>
                              {hasSelectedSlot && (
                                <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full font-semibold">
                                  ✓ Sélectionné
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                              {hasSelectedSlot && !isExpanded ? (
                                <span className="flex items-center gap-1 text-amber-700 font-medium">
                                  <Clock className="w-4 h-4" />
                                  {selectedSlotInThisDate.start_time} - {selectedSlotInThisDate.end_time}
                                </span>
                              ) : (
                                <>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {stats.totalSlots} créneau{stats.totalSlots > 1 ? 'x' : ''}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <UsersIcon className="w-4 h-4" />
                                    {stats.remainingCapacity} place{stats.remainingCapacity > 1 ? 's' : ''}{' '}
                                    disponible{stats.remainingCapacity > 1 ? 's' : ''}
                                  </span>
                                </>
                              )}
                              {stats.availableSlots === 0 && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                                  Date complète
                                </span>
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Slots List - Collapsible */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 bg-gray-50">
                            <div className="px-5 py-4 space-y-3">
                              {dateSlots.map((slot) => {
                                const isSelected = watchedSlotId === slot.id

                                return (
                                  <label
                                    key={slot.id}
                                    className={`relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                      slot.isFull
                                        ? 'opacity-60 cursor-not-allowed bg-gray-100 border-gray-300'
                                        : isSelected
                                        ? 'bg-amber-50 border-amber-400 shadow-md'
                                        : 'bg-white border-gray-200 hover:border-amber-300 hover:shadow-sm'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      value={slot.id}
                                      {...register('slotId')}
                                      disabled={slot.isFull}
                                      className="mt-1 w-5 h-5 text-amber-600"
                                    />
                                    <div className="flex-1">
                                      {/* Time */}
                                      <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className={`font-bold ${slot.isFull ? 'text-gray-500' : 'text-gray-900'}`}>
                                          {slot.start_time} - {slot.end_time}
                                        </span>
                                        {slot.isFull && (
                                          <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                                            Complet
                                          </span>
                                        )}
                                        {isSelected && !slot.isFull && (
                                          <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
                                            ✓ Sélectionné
                                          </span>
                                        )}
                                      </div>

                                      {/* Capacity Info */}
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Places disponibles</span>
                                        <span className={`font-bold ${slot.isFull ? 'text-gray-500' : 'text-amber-600'}`}>
                                          {slot.remainingCapacity} / {slot.capacity || 0}
                                        </span>
                                      </div>

                                      {/* Progress bar */}
                                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className="h-full rounded-full transition-all duration-300"
                                          style={{
                                            width: `${((slot.capacity || 0) - (slot.remainingCapacity || 0)) / (slot.capacity || 1) * 100}%`,
                                            backgroundColor: slot.isFull ? '#9CA3AF' : '#F59E0B',
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {errors.slotId && (
                  <p className="text-red-600 text-sm mt-4 font-medium">{errors.slotId.message}</p>
                )}
              </div>
            )}

            {/* Step 4: Contact Information */}
            {currentStep.id === 'contact' && (
              <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-amber-600" />
                  Vos coordonnées
                </h2>

                <div className="space-y-5">
                  <Input
                    label="Nom complet"
                    {...register('customerName')}
                    error={errors.customerName?.message}
                    required
                  />

                  <Input
                    label="Adresse email"
                    type="email"
                    {...register('email')}
                    error={errors.email?.message}
                    required
                  />

                  <Input
                    label="Numéro de téléphone"
                    type="tel"
                    {...register('phone')}
                    error={errors.phone?.message}
                    required
                  />

                  {deliveryType === 'DELIVERY' && (
                    <>
                      <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Adresse de livraison
                        </h3>
                        <div className="space-y-5">
                          <Input
                            label="Adresse"
                            {...register('address')}
                            error={errors.address?.message}
                            required
                          />

                          <div className="grid md:grid-cols-2 gap-4">
                            <Input
                              label="Code postal"
                              {...register('zip')}
                              error={errors.zip?.message}
                              required
                            />
                            <Input
                              label="Ville"
                              {...register('city')}
                              error={errors.city?.message}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes et remarques (optionnel)
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="Allergies, demandes spéciales, instructions de livraison..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Payment Method */}
            {currentStep.id === 'payment' && (
              <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-amber-600" />
                  Mode de paiement
                </h2>

                <div className="space-y-4">
                  <label className="flex items-start gap-4 p-5 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 hover:shadow-md transition-all">
                    <input
                      type="radio"
                      value="BANK_TRANSFER"
                      {...register('paymentMethod')}
                      className="mt-1.5 w-5 h-5 text-amber-600"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900">Virement bancaire</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Vous recevrez les coordonnées bancaires par email après validation de votre commande
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-5 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 hover:shadow-md transition-all">
                    <input
                      type="radio"
                      value="ON_SITE"
                      {...register('paymentMethod')}
                      className="mt-1.5 w-5 h-5 text-amber-600"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900">Paiement sur place</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Payez lors du retrait ou de la livraison
                      </p>
                      <PaymentMethodsBadge variant="compact" className="mt-3" />
                    </div>
                  </label>
                </div>

                {/* Promo Code Section */}
                <div className="mt-8 p-5 bg-amber-50 border border-amber-200 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-3">Code promo</h3>

                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-white p-4 rounded-lg border-2 border-green-500">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold text-green-700">{appliedPromo.code}</p>
                          <p className="text-sm text-gray-600">
                            Réduction de {(appliedPromo.discountCents / 100).toFixed(2)} €
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removePromoCode}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Retirer
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase())
                            setPromoError('')
                          }}
                          placeholder="Entrez votre code"
                          className="flex-1"
                          disabled={validatingPromo}
                        />
                        <Button
                          type="button"
                          onClick={applyPromoCode}
                          disabled={!promoCode.trim() || validatingPromo}
                          variant="secondary"
                        >
                          {validatingPromo ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Appliquer'
                          )}
                        </Button>
                      </div>
                      {promoError && (
                        <p className="text-sm text-red-600">{promoError}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 6: Confirmation & RGPD */}
            {currentStep.id === 'confirm' && (
              <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-amber-600" />
                  Confirmation de commande
                </h2>

                <div className="space-y-6">
                  {/* Order Summary */}
                  <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-4">Récapitulatif</h3>

                    <div className="space-y-3 mb-4">
                      {Object.entries(cart).map(([productId, qty]) => {
                        const product = event.products.find(p => p.id === productId)
                        if (!product) return null
                        return (
                          <div key={productId} className="flex justify-between">
                            <span className="text-gray-700">
                              {product.name} <span className="text-gray-500">× {qty}</span>
                            </span>
                            <span className="font-semibold">
                              {((product.price_cents * qty) / 100).toFixed(2)} €
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="border-t border-gray-300 pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sous-total</span>
                        <span className="font-semibold">{(subtotal / 100).toFixed(2)} €</span>
                      </div>

                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Remise 12 pour 11</span>
                          <span className="font-semibold">-{(discount / 100).toFixed(2)} €</span>
                        </div>
                      )}

                      {promoDiscount > 0 && (
                        <div className="flex justify-between text-sm text-amber-600">
                          <span>Code promo {appliedPromo?.code}</span>
                          <span className="font-semibold">-{(promoDiscount / 100).toFixed(2)} €</span>
                        </div>
                      )}

                      {deliveryFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Frais de livraison</span>
                          <span className="font-semibold">{(deliveryFee / 100).toFixed(2)} €</span>
                        </div>
                      )}

                      <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-300">
                        <span>Total</span>
                        <span className="text-amber-600">{(total / 100).toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>

                  {/* RGPD Consent */}
                  <label className="flex items-start gap-4 p-5 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 transition-all">
                    <input
                      type="checkbox"
                      {...register('rgpdConsent')}
                      className="mt-1.5 w-5 h-5 text-amber-600"
                    />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">
                        J'accepte la politique de confidentialité
                      </p>
                      <p className="mt-1 text-gray-600">
                        En cochant cette case, j'accepte que mes données personnelles soient utilisées dans le
                        cadre de cette commande. Vos données ne seront pas transmises à des tiers.{' '}
                        <Link href="/privacy" className="text-amber-600 hover:underline font-medium">
                          En savoir plus
                        </Link>
                      </p>
                    </div>
                  </label>
                  {errors.rgpdConsent && (
                    <p className="text-red-600 text-sm font-medium">
                      {errors.rgpdConsent.message}
                    </p>
                  )}

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      En cliquant sur "Valider la commande", vous confirmez votre commande.
                      Vous recevrez un email de confirmation avec tous les détails.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 gap-4">
              <Button
                type="button"
                onClick={goToPreviousStep}
                variant="outline"
                disabled={!canGoBack}
                className="min-w-[120px]"
              >
                ← Précédent
              </Button>

              {isLastStep ? (
                <Button
                  type="submit"
                  className="min-w-[200px]"
                  disabled={submitting || Object.keys(cart).length === 0 || !isCurrentStepValid()}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    'Valider la commande'
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={goToNextStep}
                  className="min-w-[120px]"
                  disabled={!isCurrentStepValid()}
                >
                  Suivant →
                </Button>
              )}
            </div>
          </div>

          {/* Right column - Order Summary (Sticky) - Invoice Style */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4 sticky top-4 text-sm">
              <div className="border-b-2 border-gray-900 pb-2 mb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Résumé de commande
                </h3>
              </div>

              {Object.keys(cart).length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Votre panier est vide</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Products Section - Invoice table style */}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 pb-1 border-b border-gray-300">
                      Articles
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {Object.entries(cart).map(([productId, qty]) => {
                        const product = event.products.find(p => p.id === productId)
                        if (!product) return null
                        return (
                          <div key={productId} className="flex justify-between items-baseline py-0.5">
                            <span className="text-gray-700 flex-1">
                              {product.name} <span className="text-gray-400 text-xs">×{qty}</span>
                            </span>
                            <span className="font-medium text-gray-900 ml-2 tabular-nums">
                              {((product.price_cents * qty) / 100).toFixed(2)}&nbsp;€
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Progressive info sections - Compact single line format */}
                  {(currentStepIndex >= 1 && deliveryType) && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between py-0.5">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Récupération</span>
                        </span>
                        <span className="text-gray-700 text-xs">
                          {deliveryType === 'PICKUP' && 'Retrait sur place'}
                          {deliveryType === 'DELIVERY' && 'Livraison'}
                          {deliveryType === 'ON_SITE' && 'Sur place'}
                        </span>
                      </div>
                    </div>
                  )}

                  {currentStepIndex >= 2 && watchedSlotId && event && (
                    (() => {
                      const selectedSlot = event.slots.find(s => s.id === watchedSlotId)
                      return selectedSlot ? (
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-start justify-between py-0.5">
                            <span className="text-gray-500 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">Créneau</span>
                            </span>
                            <div className="text-right text-xs text-gray-700 leading-tight">
                              <div>{new Date(selectedSlot.date).toLocaleDateString('fr-BE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}</div>
                              <div className="text-gray-500">{selectedSlot.start_time} - {selectedSlot.end_time}</div>
                            </div>
                          </div>
                        </div>
                      ) : null
                    })()
                  )}

                  {currentStepIndex >= 3 && watch('customerName') && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-start justify-between py-0.5">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Client</span>
                        </span>
                        <div className="text-right text-xs text-gray-700 leading-tight max-w-[60%]">
                          <div className="truncate">{watch('customerName')}</div>
                          <div className="text-gray-500 truncate">{watch('email')}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStepIndex >= 4 && watch('paymentMethod') && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between py-0.5">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Paiement</span>
                        </span>
                        <span className="text-gray-700 text-xs">
                          {watch('paymentMethod') === 'BANK_TRANSFER' && 'Virement'}
                          {watch('paymentMethod') === 'ON_SITE' && 'Sur place'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Price Summary - Invoice footer style */}
                  <div className="pt-3 mt-3 border-t-2 border-gray-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sous-total</span>
                      <span className="font-medium tabular-nums">{(subtotal / 100).toFixed(2)}&nbsp;€</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Remise 12 pour 11</span>
                        <span className="font-medium tabular-nums">-{(discount / 100).toFixed(2)}&nbsp;€</span>
                      </div>
                    )}

                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-amber-600">
                        <span>Code promo {appliedPromo?.code}</span>
                        <span className="font-medium tabular-nums">-{(promoDiscount / 100).toFixed(2)}&nbsp;€</span>
                      </div>
                    )}

                    {deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Livraison</span>
                        <span className="font-medium tabular-nums">{(deliveryFee / 100).toFixed(2)}&nbsp;€</span>
                      </div>
                    )}

                    <div className="flex justify-between items-baseline pt-2 mt-2 border-t-2 border-gray-900">
                      <span className="text-base font-bold">Total</span>
                      <span className="text-lg font-bold text-amber-600 tabular-nums">
                        {(total / 100).toFixed(2)}&nbsp;€
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 pt-1.5 text-center italic">
                      {totalQty} article{totalQty > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </main>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={() => {
            addToCart(selectedProduct.id)
            setSelectedProduct(null)
          }}
          onUpdateQuantity={(qty) => {
            updateQuantity(selectedProduct.id, qty)
          }}
          currentQuantity={cart[selectedProduct.id] || 0}
        />
      )}
    </div>
  )
}
