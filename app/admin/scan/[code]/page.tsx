'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Package, User, CreditCard, Calendar, ArrowLeft, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useToast } from '@/contexts/ToastContext'

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

export default function AdminScanPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter()
  const { addToast } = useToast()
  const [code, setCode] = useState<string>('')
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    params.then(p => {
      setCode(p.code)
      fetchOrder(p.code)
    })
  }, [])

  const fetchOrder = async (orderCode: string) => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/orders/${orderCode}`)

      if (!res.ok) {
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

  const updateOrderStatus = async (newStatus: 'PAID' | 'DELIVERED') => {
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

      // Refresh order data
      await fetchOrder(code)
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

    const badge = badges[status as keyof typeof badges] || badges.PENDING

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la commande...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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

  const canMarkAsPaid = order.status === 'PENDING'
  const canMarkAsDelivered = ['PAID', 'PREPARED'].includes(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <div className="text-sm text-gray-500">
            Admin - Scan de commande
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Section Color Bar */}
          <div
            className="h-2"
            style={{ backgroundColor: order.event.section.color }}
          />

          {/* Order Header */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {order.code}
                </h1>
                <p className="text-gray-600">{order.event.name}</p>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </div>

          {/* Customer Info */}
          <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Client
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium text-gray-900">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="font-medium text-gray-900">{order.phone}</p>
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
            <div className="mt-4 pt-4 border-t-2 border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold text-gray-900">Total</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatPrice(order.total_cents)}
                </p>
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
                  <p className="font-mono text-sm font-medium text-gray-900">
                    {order.payment_communication}
                  </p>
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
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marquer comme payé
                    </>
                  )}
                </Button>
              )}

              {canMarkAsDelivered && (
                <Button
                  onClick={() => updateOrderStatus('DELIVERED')}
                  disabled={isUpdating}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Marquer comme livré
                    </>
                  )}
                </Button>
              )}

              {!canMarkAsPaid && !canMarkAsDelivered && (
                <div className="flex-1 text-center py-4">
                  <p className="text-gray-600">
                    {order.status === 'DELIVERED' && 'Commande déjà livrée'}
                    {order.status === 'CANCELLED' && 'Commande annulée'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
