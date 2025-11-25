'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, Package, Truck, Calendar, User, CreditCard, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

interface Product {
  id: string
  name: string
  product_type: string
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

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('fr-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

    const badge = badges[status as keyof typeof badges] || badges.PENDING

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  const getDeliveryTypeLabel = (type: string): string => {
    switch (type) {
      case 'PICKUP':
        return 'Retrait sur place'
      case 'DELIVERY':
        return 'Livraison'
      case 'ON_SITE':
        return 'Sur place'
      default:
        return type
    }
  }

  const getPaymentMethodLabel = (method: string): string => {
    switch (method) {
      case 'BANK_TRANSFER':
        return 'Virement bancaire'
      case 'ON_SITE':
        return 'Paiement sur place'
      default:
        return method
    }
  }

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

  // Calculate subtotal
  const subtotal = order.subtotal_cents || order.items.reduce(
    (sum, item) => sum + item.unit_price_cents * item.quantity,
    0
  )
  const discount = order.discount_cents || 0
  const promoDiscount = order.promo_discount_cents || 0
  const deliveryFee = order.delivery_fee_cents || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white border-b border-amber-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/event/${order.event.slug}`}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Retour à l'événement
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Section Color Bar */}
          <div
            className="h-2"
            style={{ backgroundColor: order.event.section.color }}
          />

          {/* Header */}
          <div className="px-8 py-6 text-center border-b border-gray-100">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Récapitulatif de commande
            </h1>
            <p className="text-lg text-gray-600">
              {order.event.name}
            </p>
          </div>

          {/* Order Code & Status */}
          <div className="px-8 py-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Numéro de commande</p>
                <p className="text-2xl font-bold text-gray-900">{order.code}</p>
              </div>
              {getStatusBadge(order.status)}
            </div>

            {/* Customer Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations client
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-gray-700">
                  <strong>Nom :</strong> {order.customer_name}
                </p>
                <p className="text-gray-700">
                  <strong>Email :</strong> {order.email}
                </p>
                <p className="text-gray-700">
                  <strong>Téléphone :</strong> {order.phone}
                </p>
              </div>
            </div>

            {/* Delivery Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Mode de réception
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-gray-700">
                  <strong>Type :</strong> {getDeliveryTypeLabel(order.delivery_type)}
                </p>

                {order.delivery_type === 'PICKUP' && order.slot && (
                  <div>
                    <p className="text-gray-700 mb-2">
                      <strong>Créneau de retrait :</strong>
                    </p>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(order.slot.date)} de {order.slot.start_time} à {order.slot.end_time}
                      </span>
                    </div>
                  </div>
                )}

                {order.delivery_type === 'DELIVERY' && order.delivery_address && (
                  <p className="text-gray-700">
                    <strong>Adresse :</strong> {order.delivery_address}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Détail de la commande
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">
                        Produit
                      </th>
                      <th className="text-center py-2 text-sm font-medium text-gray-600">
                        Qté
                      </th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">
                        Prix unit.
                      </th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 text-gray-900">{item.product.name}</td>
                        <td className="py-3 text-center text-gray-700">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-right text-gray-700">
                          {formatPrice(item.unit_price_cents)}
                        </td>
                        <td className="py-3 text-right font-medium text-gray-900">
                          {formatPrice(item.unit_price_cents * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-gray-300">
                    <tr>
                      <td colSpan={3} className="py-2 text-right text-gray-600">
                        Sous-total :
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900">
                        {formatPrice(subtotal)}
                      </td>
                    </tr>
                    {discount > 0 && (
                      <tr>
                        <td colSpan={3} className="py-2 text-right text-green-600">
                          Remise 12 pour 11 :
                        </td>
                        <td className="py-2 text-right font-medium text-green-600">
                          -{formatPrice(discount)}
                        </td>
                      </tr>
                    )}
                    {promoDiscount > 0 && (
                      <tr>
                        <td colSpan={3} className="py-2 text-right text-amber-600">
                          Code promo {order.promo_code} :
                        </td>
                        <td className="py-2 text-right font-medium text-amber-600">
                          -{formatPrice(promoDiscount)}
                        </td>
                      </tr>
                    )}
                    {deliveryFee > 0 && (
                      <tr>
                        <td colSpan={3} className="py-2 text-right text-gray-600">
                          Frais de livraison :
                        </td>
                        <td className="py-2 text-right font-medium text-gray-900">
                          {formatPrice(deliveryFee)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="py-2 text-right text-lg font-semibold text-gray-900">
                        Total :
                      </td>
                      <td className="py-2 text-right text-lg font-bold text-amber-600">
                        {formatPrice(order.total_cents)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Paiement
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-gray-700">
                  <strong>Méthode :</strong> {getPaymentMethodLabel(order.payment_method)}
                </p>

                {order.payment_method === 'BANK_TRANSFER' && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      Informations de virement :
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bénéficiaire :</span>
                        <span className="font-mono font-semibold text-gray-900">
                          {order.event.section.iban_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IBAN :</span>
                        <span className="font-mono font-semibold text-gray-900">
                          {order.event.section.iban}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Montant :</span>
                        <span className="font-semibold text-amber-600">
                          {formatPrice(order.total_cents)}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Communication :</span>
                        <span className="font-mono font-semibold text-gray-900 bg-white px-2 py-1 rounded border border-amber-300">
                          {order.payment_communication}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-amber-200 mt-3">
                      <p className="text-xs text-amber-800">
                        ⚠️ <strong>Important :</strong> N'oubliez pas d'indiquer la communication pour que nous puissions identifier votre paiement.
                      </p>
                    </div>
                  </div>
                )}

                {order.payment_method === 'ON_SITE' && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-700">
                      💳 Vous avez choisi le <strong>paiement sur place</strong>.
                    </p>
                    <p className="text-gray-700 mt-2">
                      Montant à régler : <strong className="text-lg text-amber-600">{formatPrice(order.total_cents)}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Info */}
            <div className="pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500 mb-2">
                Commande créée le {formatDateTime(order.created_at)}
              </p>
              <p className="text-sm text-gray-600">
                Des questions ? Contactez-nous à{' '}
                <a
                  href="mailto:contact@pionniers-ecaussinnes.be"
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  contact@pionniers-ecaussinnes.be
                </a>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Link href="/" className="flex-1">
                <Button variant="secondary" className="w-full">
                  Retour à l'accueil
                </Button>
              </Link>
              <Link href={`/event/${order.event.slug}`} className="flex-1">
                <Button className="w-full bg-amber-600 hover:bg-amber-700">
                  Voir l'événement
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
