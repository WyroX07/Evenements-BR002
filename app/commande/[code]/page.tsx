'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, Package, Calendar, User, CreditCard, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { useIsMobile } from '@/hooks/useIsMobile'

interface Product {
  id: string
  name: string
}

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  unit_price_cents: number
  product: Product
}

interface Section {
  id: string
  name: string
  color: string
  iban: string
  iban_name: string
}

interface Event {
  id: string
  name: string
  slug: string
  section: Section
}

interface Slot {
  id: string
  date: string
  start_time: string
  end_time: string
}

interface Order {
  id: string
  code: string
  customer_name: string
  email: string
  phone: string
  delivery_type: 'PICKUP' | 'DELIVERY' | 'ON_SITE'
  delivery_address: string | null
  payment_method: 'BANK_TRANSFER' | 'ON_SITE'
  payment_communication: string
  subtotal_cents?: number
  discount_cents?: number
  promo_discount_cents?: number
  promo_code?: string | null
  delivery_fee_cents?: number
  total_cents: number
  status: 'PENDING' | 'PAID' | 'PREPARED' | 'DELIVERED' | 'CANCELLED'
  created_at: string
  event: Event
  slot: Slot | null
  items: OrderItem[]
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const isMobile = useIsMobile()
  const code = params.code as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  useEffect(() => {
    if (!code) return

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${code}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Commande introuvable')
          return
        }

        setOrder(data.order)

        // Use QR code from API
        if (data.qrCodeDataUrl) {
          setQrCodeUrl(data.qrCodeDataUrl)
        }
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('Erreur lors de la récupération de la commande')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [code])

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2) + ' €'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      PAID: { label: 'Payée', color: 'bg-green-100 text-green-800' },
      PREPARED: { label: 'Préparée', color: 'bg-blue-100 text-blue-800' },
      DELIVERED: { label: 'Livrée', color: 'bg-purple-100 text-purple-800' },
      CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
    }
    return badges[status as keyof typeof badges] || badges.PENDING
  }

  if (loading) {
    return (
      <div className={`${isMobile ? '' : 'min-h-screen bg-gray-50'} flex items-center justify-center py-16`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className={`${isMobile ? '' : 'min-h-screen bg-gray-50'} flex items-center justify-center p-4`}>
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande introuvable</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    )
  }

  const statusBadge = getStatusBadge(order.status)

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 pt-4 pb-3">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 mb-3 active:opacity-70"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Retour</span>
            </button>

            <div
              className="h-1 rounded-full mb-4"
              style={{ backgroundColor: order.event.section.color }}
            />

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">#{order.code}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusBadge.color}`}>
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-sm text-gray-600">{order.event.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* QR Code */}
          {qrCodeUrl && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  📱 QR Code de {order.delivery_type === 'PICKUP' ? 'retrait' : order.delivery_type === 'DELIVERY' ? 'livraison' : 'présence'}
                </h2>
              </div>
              <div className="p-6 text-center">
                <img src={qrCodeUrl} alt="QR Code" className="mx-auto rounded-lg" style={{ maxWidth: '250px' }} />
                <p className="text-xs text-gray-600 mt-3">
                  Présentez ce QR code lors {order.delivery_type === 'PICKUP' ? 'du retrait' : order.delivery_type === 'DELIVERY' ? 'de la livraison' : 'sur place'}
                </p>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-700" />
                Informations client
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Nom</p>
                  <p className="font-semibold text-gray-900 text-base">{order.customer_name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                  <a href={`tel:${order.phone}`} className="font-medium text-blue-600 text-sm active:text-blue-700">
                    {order.phone}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <a href={`mailto:${order.email}`} className="font-medium text-blue-600 text-sm truncate block active:text-blue-700">
                    {order.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-700" />
                Articles ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex-1 pr-3">
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{item.product.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.quantity} × {formatPrice(item.unit_price_cents)}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 text-base tabular-nums">
                    {formatPrice(item.quantity * item.unit_price_cents)}
                  </p>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t-2 border-gray-200 space-y-2">
              {order.subtotal_cents !== undefined && order.subtotal_cents > 0 && (
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Sous-total</p>
                  <p className="font-medium text-gray-900">{formatPrice(order.subtotal_cents)}</p>
                </div>
              )}
              {order.discount_cents !== undefined && order.discount_cents > 0 && (
                <div className="flex justify-between text-sm">
                  <p className="text-green-600">Promotion 12 bouteilles (10€)</p>
                  <p className="font-medium text-green-600">-{formatPrice(order.discount_cents)}</p>
                </div>
              )}
              {order.promo_discount_cents !== undefined && order.promo_discount_cents > 0 && (
                <div className="flex justify-between text-sm">
                  <p className="text-amber-600">Code promo {order.promo_code}</p>
                  <p className="font-medium text-amber-600">-{formatPrice(order.promo_discount_cents)}</p>
                </div>
              )}
              {order.delivery_fee_cents !== undefined && order.delivery_fee_cents > 0 && (
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Frais de livraison</p>
                  <p className="font-medium text-gray-900">{formatPrice(order.delivery_fee_cents)}</p>
                </div>
              )}
              <div className="flex justify-between pt-3 mt-1 border-t border-gray-300">
                <p className="font-bold text-gray-900 text-base">Total</p>
                <p className="text-xl font-bold text-amber-600 tabular-nums">{formatPrice(order.total_cents)}</p>
              </div>
            </div>
          </div>

          {/* Payment & Delivery Row */}
          <div className="grid grid-cols-1 gap-3">
            {/* Payment Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-700" />
                  Paiement
                </h2>
              </div>
              <div className="p-4 space-y-2.5">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Méthode</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {order.payment_method === 'BANK_TRANSFER' ? 'Virement bancaire' : 'Paiement sur place'}
                  </p>
                </div>
                {order.payment_method === 'BANK_TRANSFER' && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Communication</p>
                    <p className="font-mono text-sm font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded border border-amber-200">
                      {order.payment_communication}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery/Pickup Info */}
            {order.slot && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-700" />
                    {order.delivery_type === 'DELIVERY' ? 'Livraison' : order.delivery_type === 'ON_SITE' ? 'Sur place' : 'Retrait'}
                  </h2>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-gray-900 text-sm mb-1">
                    {formatDate(order.slot.date)}
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    De {order.slot.start_time} à {order.slot.end_time}
                  </p>
                  {order.delivery_address && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Adresse</p>
                      <p className="text-sm text-gray-900">{order.delivery_address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600">
              Des questions ? Contactez-nous à{' '}
              <a
                href="mailto:contact@pionniers-ecaussinnes.be"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                contact@pionniers-ecaussinnes.be
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Desktop version
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Section Color Bar */}
          <div className="h-2" style={{ backgroundColor: order.event.section.color }} />

          {/* Order Header */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">#{order.code}</h1>
                <p className="text-gray-600">{order.event.name}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
            </div>
          </div>

          {/* QR Code */}
          {qrCodeUrl && (
            <div className="px-8 py-6 bg-blue-50 border-b border-blue-100">
              <div className="flex items-start gap-6">
                <img src={qrCodeUrl} alt="QR Code" className="rounded-lg shadow-md" style={{ width: '180px', height: '180px' }} />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    📱 QR Code de {order.delivery_type === 'PICKUP' ? 'retrait' : order.delivery_type === 'DELIVERY' ? 'livraison' : 'présence'}
                  </h2>
                  <p className="text-gray-700">
                    Présentez ce QR code lors {order.delivery_type === 'PICKUP' ? 'du retrait de votre commande' : order.delivery_type === 'DELIVERY' ? 'de la livraison' : 'sur place'}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Client
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium text-gray-900">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="font-medium text-gray-900">{order.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{order.email}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Articles
            </h2>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × {formatPrice(item.unit_price_cents)}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatPrice(item.quantity * item.unit_price_cents)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t-2 border-gray-200 space-y-2">
              {order.subtotal_cents !== undefined && order.subtotal_cents > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <p className="text-gray-600">Sous-total</p>
                  <p className="font-medium text-gray-900">{formatPrice(order.subtotal_cents)}</p>
                </div>
              )}
              {order.discount_cents !== undefined && order.discount_cents > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <p className="text-green-600">Promotion 12 bouteilles (10€)</p>
                  <p className="font-medium text-green-600">-{formatPrice(order.discount_cents)}</p>
                </div>
              )}
              {order.promo_discount_cents !== undefined && order.promo_discount_cents > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <p className="text-amber-600">Code promo {order.promo_code}</p>
                  <p className="font-medium text-amber-600">-{formatPrice(order.promo_discount_cents)}</p>
                </div>
              )}
              {order.delivery_fee_cents !== undefined && order.delivery_fee_cents > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <p className="text-gray-600">Frais de livraison</p>
                  <p className="font-medium text-gray-900">{formatPrice(order.delivery_fee_cents)}</p>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <p className="text-lg font-semibold text-gray-900">Total</p>
                <p className="text-2xl font-bold text-amber-600">{formatPrice(order.total_cents)}</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Paiement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Méthode</p>
                <p className="font-medium text-gray-900">
                  {order.payment_method === 'BANK_TRANSFER' ? 'Virement bancaire' : 'Sur place'}
                </p>
              </div>
              {order.payment_method === 'BANK_TRANSFER' && (
                <div>
                  <p className="text-sm text-gray-500">Communication</p>
                  <p className="font-mono text-sm font-medium text-amber-600">{order.payment_communication}</p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery/Pickup Info */}
          {order.slot && (
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {order.delivery_type === 'DELIVERY' ? 'Livraison' : order.delivery_type === 'ON_SITE' ? 'Sur place' : 'Retrait'}
              </h2>
              <div>
                <p className="text-gray-900">
                  {formatDate(order.slot.date)} de {order.slot.start_time} à {order.slot.end_time}
                </p>
                {order.delivery_address && (
                  <p className="text-gray-600 mt-2">{order.delivery_address}</p>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Des questions ? Contactez-nous à{' '}
              <a
                href="mailto:contact@pionniers-ecaussinnes.be"
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                contact@pionniers-ecaussinnes.be
              </a>
            </p>
            <Link href="/">
              <Button className="bg-amber-600 hover:bg-amber-700">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
