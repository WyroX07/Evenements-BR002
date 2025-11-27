'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  CheckCircle,
  Loader2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Truck,
  Store,
  CreditCard,
  Banknote,
  Package,
  Wine
} from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

interface Order {
  id: string
  code: string // Database column is 'code', not 'order_code'
  customer_name: string
  email: string
  phone: string
  delivery_type: string
  address?: string // Database column is 'address', not 'delivery_address'
  city?: string // Database column is 'city', not 'delivery_city'
  zip?: string // Database column is 'zip', not 'delivery_zip'
  payment_method: string
  total_cents: number
  subtotal_cents?: number
  discount_cents?: number
  delivery_fee_cents?: number
  promo_discount_cents?: number
  status: string
  created_at: string
  items: Array<{
    product_name: string
    qty: number // Database column is 'qty', not 'quantity'
    unit_price_cents: number
  }>
  slot?: {
    date: string
    start_time: string
    end_time: string
  }
  event: {
    name: string
    slug: string
  }
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/details/${orderId}`)
        if (!res.ok) throw new Error('Order not found')
        const data = await res.json()
        console.log('[Confirmation Page] Order data:', data.order)
        console.log('[Confirmation Page] Order items:', data.order.items)
        setOrder(data.order)
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('Commande introuvable')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const formatPrice = (cents: number): string => {
    return `${(cents / 100).toFixed(2)} €`
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  const getDeliveryTypeLabel = (type: string): { label: string; icon: any; description: string; address?: string } => {
    switch (type) {
      case 'PICKUP':
        return {
          label: 'Retrait au local',
          icon: Store,
          description: 'Vous viendrez récupérer votre commande au local scout',
          address: 'Rue des Fontenelles 26, 7190 Écaussinnes'
        }
      case 'ON_SITE':
        return {
          label: 'Retrait sur place',
          icon: Package,
          description: 'Retrait lors de l\'événement scout'
        }
      case 'DELIVERY':
        return {
          label: 'Livraison à domicile',
          icon: Truck,
          description: 'Votre commande sera livrée à l\'adresse indiquée'
        }
      default:
        return {
          label: type,
          icon: Package,
          description: ''
        }
    }
  }

  const getPaymentMethodLabel = (method: string): { label: string; icon: any } => {
    switch (method) {
      case 'BANK_TRANSFER':
        return { label: 'Virement bancaire', icon: Banknote }
      case 'ON_DELIVERY':
        return { label: 'Paiement à la livraison', icon: CreditCard }
      case 'ON_SITE':
        return { label: 'Paiement sur place', icon: CreditCard }
      default:
        return { label: method, icon: CreditCard }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Commande introuvable
          </h1>
          <p className="text-gray-600 mb-6">
            La commande que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Link href="/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    )
  }

  const deliveryInfo = getDeliveryTypeLabel(order.delivery_type)
  const DeliveryIcon = deliveryInfo.icon
  const paymentInfo = getPaymentMethodLabel(order.payment_method)
  const PaymentIcon = paymentInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full mb-4 shadow-lg">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Merci pour votre commande !
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Votre commande a été enregistrée avec succès
          </p>
          <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full">
            <Package className="w-5 h-5 text-amber-700" />
            <span className="text-sm text-gray-600">N° de commande :</span>
            <span className="font-mono font-bold text-amber-700 text-lg">{order.code}</span>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
            <Wine className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Votre commande
            </h2>
          </div>

          <div className="space-y-3 mb-6">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                    <Wine className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-500">Quantité : {item.qty}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatPrice(item.unit_price_cents * item.qty)}</p>
                  <p className="text-xs text-gray-500">{formatPrice(item.unit_price_cents)} / unité</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t-2 border-amber-200">
            <span className="text-xl font-bold text-gray-900">Total</span>
            <span className="text-3xl font-bold text-amber-700">
              {formatPrice(order.total_cents)}
            </span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <DeliveryIcon className="w-6 h-6 text-blue-700" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {deliveryInfo.label}
              </h2>
              <p className="text-sm text-gray-600">{deliveryInfo.description}</p>
            </div>
          </div>

          {order.slot && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-700 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Créneau {order.delivery_type === 'DELIVERY' ? 'de livraison' : 'de retrait'}</p>
                  <p className="text-gray-700">{formatDate(order.slot.date)}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{order.slot.start_time} - {order.slot.end_time}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Adresse de retrait pour PICKUP */}
          {order.delivery_type === 'PICKUP' && deliveryInfo.address && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-700 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Adresse de retrait</p>
                  <p className="text-gray-700">{deliveryInfo.address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Adresse de livraison pour DELIVERY */}
          {order.delivery_type === 'DELIVERY' && order.address && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-700 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Adresse de livraison</p>
                  <p className="text-gray-700">
                    {order.address}<br />
                    {order.zip} {order.city}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <PaymentIcon className="w-6 h-6 text-green-700" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Mode de paiement
              </h2>
              <p className="text-lg text-gray-700">{paymentInfo.label}</p>
            </div>
          </div>

          {order.payment_method === 'BANK_TRANSFER' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-700">
                <strong>Important :</strong> Les coordonnées bancaires pour effectuer le virement
                vous seront envoyées par email à <strong>{order.email}</strong>
              </p>
            </div>
          )}

          {order.payment_method !== 'BANK_TRANSFER' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-700">
                Le paiement sera effectué {order.delivery_type === 'DELIVERY' ? 'à la livraison' : 'lors du retrait'}.
                Vous pourrez payer en espèces ou par carte bancaire.
              </p>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Vos coordonnées
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
              <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <p className="font-medium text-gray-900">{order.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
              <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Téléphone</p>
                <p className="font-medium text-gray-900">{order.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-amber-600" />
            Prochaines étapes
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Confirmation par email</p>
                <p className="text-sm text-gray-700">
                  Un email de confirmation va être envoyé à <strong>{order.email}</strong> avec tous les détails de votre commande.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  {order.payment_method === 'BANK_TRANSFER' ? 'Instructions de paiement' : 'Préparation de votre commande'}
                </p>
                <p className="text-sm text-gray-700">
                  {order.payment_method === 'BANK_TRANSFER'
                    ? "Vous recevrez les coordonnées bancaires pour effectuer le virement. Une fois le paiement reçu, votre commande sera préparée."
                    : "Votre commande sera préparée avec soin. Vous pourrez payer lors du retrait ou de la livraison."}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Rappel avant {order.delivery_type === 'DELIVERY' ? 'livraison' : 'retrait'}</p>
                <p className="text-sm text-gray-700">
                  Vous recevrez un email de rappel quelques jours avant la date prévue.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={`/event/${order.event.slug}`} className="flex-1">
            <Button variant="secondary" className="w-full h-12">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour à l'événement
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button className="w-full h-12 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
