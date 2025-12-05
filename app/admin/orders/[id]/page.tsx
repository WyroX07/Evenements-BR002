'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useIsMobile } from '@/hooks/useIsMobile'
import { ArrowLeft, Package, User, CreditCard, Calendar, Loader2, CheckCircle, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useToast } from '@/contexts/ToastContext'
import MobileAdminLayout from '@/components/admin/mobile/MobileAdminLayout'
import AdminLayout from '@/components/admin/AdminLayout'

interface Product {
  id: string
  name: string
  product_type: string
}

interface OrderItem {
  id: string
  product_id: string
  qty: number // Database column is 'qty', not 'quantity'
  unit_price_cents: number
  product: Product
}

interface Section {
  id: string
  name: string
  color: string
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

export default function AdminOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const isMobile = useIsMobile()
  const { addToast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params?.id) {
      fetchOrder(params.id as string)
    }
  }, [params?.id])

  const fetchOrder = async (orderId: string) => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/orders/${orderId}`)

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin/login')
          return
        }
        if (res.status === 404) {
          setError('Commande introuvable')
        } else {
          setError('Erreur de chargement')
        }
        return
      }

      const data = await res.json()
      setOrder(data.order)
    } catch (err) {
      setError('Erreur de chargement de la commande')
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus: 'PAID' | 'PREPARED' | 'DELIVERED' | 'CANCELLED') => {
    if (!order) return

    try {
      setIsUpdating(true)
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Erreur de mise à jour')
      }

      addToast('Statut mis à jour avec succès', 'success')
      await fetchOrder(order.id)
    } catch (err) {
      addToast('Erreur lors de la mise à jour', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

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

  if (isLoading) {
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
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande introuvable</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au dashboard
          </Button>
        </div>
      </div>
    )
  }

  const statusBadge = getStatusBadge(order.status)
  const canMarkAsPaid = order.status === 'PENDING'
  const canMarkAsPrepared = order.status === 'PAID'
  const canMarkAsDelivered = ['PAID', 'PREPARED'].includes(order.status)
  const canCancel = !['DELIVERED', 'CANCELLED'].includes(order.status)

  if (isMobile) {
    return (
      <MobileAdminLayout>
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 pt-4 pb-3">
            <button
              onClick={() => router.push(`/admin/events/${order.event.id}`)}
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
                      {item.qty} × {formatPrice(item.unit_price_cents)}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 text-base tabular-nums">
                    {formatPrice(item.qty * item.unit_price_cents)}
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
                <p className="text-xl font-bold text-[#003f5c] tabular-nums">{formatPrice(order.total_cents)}</p>
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
                    <p className="font-mono text-sm font-bold text-[#003f5c] bg-blue-50 px-3 py-2 rounded border border-blue-200">
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
                    {order.delivery_type === 'DELIVERY' ? 'Livraison' : 'Retrait'}
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

          {/* Quick Actions */}
          {(canMarkAsPaid || canMarkAsPrepared || canMarkAsDelivered || canCancel) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">Actions rapides</h2>
              </div>
              <div className="p-4 space-y-2.5">
                {canMarkAsPaid && (
                  <button
                    onClick={() => updateOrderStatus('PAID')}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg font-semibold text-sm active:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Marquer comme payée
                  </button>
                )}
                {canMarkAsPrepared && (
                  <button
                    onClick={() => updateOrderStatus('PREPARED')}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Package className="w-4 h-4" />
                    )}
                    Marquer comme préparée
                  </button>
                )}
                {canMarkAsDelivered && (
                  <button
                    onClick={() => updateOrderStatus('DELIVERED')}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-lg font-semibold text-sm active:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Marquer comme livrée
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={() => updateOrderStatus('CANCELLED')}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 border-2 border-red-200 rounded-lg font-semibold text-sm active:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Annuler la commande
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </MobileAdminLayout>
    )
  }

  // Desktop version
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push(`/admin/events/${order.event.id}`)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux commandes
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
                      {item.qty} × {formatPrice(item.unit_price_cents)}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatPrice(item.qty * item.unit_price_cents)}
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
                  <p className="font-mono text-sm font-medium text-gray-900">{order.payment_communication}</p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery/Pickup Info */}
          {order.slot && (
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {order.delivery_type === 'DELIVERY' ? 'Livraison' : 'Retrait'}
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

          {/* Quick Actions */}
          <div className="px-8 py-6 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {canMarkAsPaid && (
                <Button
                  onClick={() => updateOrderStatus('PAID')}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marquer comme payé
                </Button>
              )}
              {canMarkAsPrepared && (
                <Button
                  onClick={() => updateOrderStatus('PREPARED')}
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Marquer comme préparé
                </Button>
              )}
              {canMarkAsDelivered && (
                <Button
                  onClick={() => updateOrderStatus('DELIVERED')}
                  disabled={isUpdating}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marquer comme livré
                </Button>
              )}
              {canCancel && (
                <Button
                  onClick={() => updateOrderStatus('CANCELLED')}
                  disabled={isUpdating}
                  className="flex-1 bg-red-50 text-red-600 hover:bg-red-100"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              )}
            </div>
          </div>
        </div>
        </main>
      </div>
    </AdminLayout>
  )
}
