'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, Package, Truck, Calendar, User, CreditCard, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import PaymentMethodsBadge from '@/components/payment/PaymentMethodsBadge'

interface OrderItem {
  id: string
  quantity: number
  unit_price_cents: number
  total_price_cents: number
  product: {
    id: string
    name: string
    description: string
    product_type: string
  }
}

interface PromoCode {
  id: string
  code: string
  discount_cents: number
  description: string
}

interface Event {
  id: string
  name: string
  slug: string
  start_date: string
  end_date: string
  config: any
  section: {
    id: string
    name: string
    iban: string
    iban_name: string
  }
}

interface Order {
  id: string
  order_code: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_method: 'PICKUP' | 'DELIVERY'
  delivery_address: string | null
  delivery_zip: string | null
  delivery_city: string | null
  delivery_slot: string | null
  subtotal_cents: number
  delivery_fee_cents: number
  discount_cents: number
  total_cents: number
  notes: string | null
  status: string
  created_at: string
  event: Event
  items: OrderItem[]
  promo_code: PromoCode | null
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('Erreur lors de la récupération de la commande')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [code])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de votre commande...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande introuvable</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Nous n\'avons pas pu trouver cette commande. Vérifiez le code de commande.'}
          </p>
          <Button onClick={() => router.push('/')} className="bg-amber-600 hover:bg-amber-700">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href={`/event/${order.event.slug}`} className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'événement
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Commande confirmée</h1>
              <p className="text-amber-100">
                Merci pour votre commande {order.customer_name} !
              </p>
            </div>
            <CheckCircle className="w-16 h-16 text-green-300" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order info card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Détails de la commande</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Commande passée le {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Code de commande</div>
                  <div className="text-2xl font-bold text-amber-600">{order.order_code}</div>
                </div>
              </div>

              {/* Event info */}
              <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <div>
                    <div className="font-semibold text-gray-900">{order.event.name}</div>
                    <div className="text-sm text-gray-600">{order.event.section.name}</div>
                  </div>
                </div>
              </div>

              {/* Items list */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 mb-3">Articles commandés</h3>
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.product.name}</div>
                      {item.product.description && (
                        <div className="text-sm text-gray-600 mt-1">{item.product.description}</div>
                      )}
                      <div className="text-sm text-gray-500 mt-1">
                        {item.quantity} × {(item.unit_price_cents / 100).toFixed(2)} ¬
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900 ml-4">
                      {(item.total_price_cents / 100).toFixed(2)} ¬
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="text-gray-900">{(order.subtotal_cents / 100).toFixed(2)} ¬</span>
                </div>

                {order.delivery_method === 'DELIVERY' && order.delivery_fee_cents > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Frais de livraison
                    </span>
                    <span className="text-gray-900">{(order.delivery_fee_cents / 100).toFixed(2)} ¬</span>
                  </div>
                )}

                {order.promo_code && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      Code promo ({order.promo_code.code})
                    </span>
                    <span>-{(order.promo_code.discount_cents / 100).toFixed(2)} ¬</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-amber-600">{(order.total_cents / 100).toFixed(2)} ¬</span>
                </div>
              </div>
            </div>

            {/* Delivery/Pickup info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {order.delivery_method === 'DELIVERY' ? (
                  <>
                    <Truck className="w-5 h-5 text-amber-600" />
                    Livraison
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5 text-amber-600" />
                    Retrait
                  </>
                )}
              </h3>

              {order.delivery_method === 'DELIVERY' ? (
                <div>
                  <p className="text-gray-900 font-medium">Adresse de livraison</p>
                  <p className="text-gray-600 mt-1">{order.delivery_address}</p>
                  <p className="text-gray-600">{order.delivery_zip} {order.delivery_city}</p>
                  {order.delivery_slot && (
                    <p className="text-sm text-gray-500 mt-2">
                      Créneau: {order.delivery_slot}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  {order.delivery_slot && (
                    <div>
                      <p className="text-gray-900 font-medium">Créneau de retrait</p>
                      <p className="text-gray-600 mt-1">{order.delivery_slot}</p>
                    </div>
                  )}
                </div>
              )}

              {order.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700">Notes</p>
                  <p className="text-sm text-gray-600 mt-1">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-600" />
                Vos coordonnées
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600">Nom</div>
                  <div className="font-medium text-gray-900">{order.customer_name}</div>
                </div>
                <div>
                  <div className="text-gray-600">Email</div>
                  <div className="font-medium text-gray-900">{order.customer_email}</div>
                </div>
                <div>
                  <div className="text-gray-600">Téléphone</div>
                  <div className="font-medium text-gray-900">{order.customer_phone}</div>
                </div>
              </div>
            </div>

            {/* Payment info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                Paiement
              </h3>
              <PaymentMethodsBadge />
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900 font-medium">Virement bancaire</p>
                <div className="mt-2 space-y-1 text-xs text-blue-800">
                  <div>
                    <span className="font-medium">IBAN:</span> {order.event.section.iban}
                  </div>
                  <div>
                    <span className="font-medium">Bénéficiaire:</span> {order.event.section.iban_name}
                  </div>
                  <div>
                    <span className="font-medium">Communication:</span> {order.order_code}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                Merci d'indiquer le code de commande en communication pour faciliter le traitement de votre paiement.
              </p>
            </div>

            {/* Help */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Besoin d'aide ?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Conservez ce code de commande : <strong>{order.order_code}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Pour toute question concernant votre commande, contactez-nous en mentionnant ce code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
