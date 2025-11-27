'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, Calendar, ShoppingBag, Edit, Trash2, Plus, Download, ChevronRight } from 'lucide-react'
import MobileAdminLayout from './MobileAdminLayout'

interface Section {
  id: string
  name: string
  color: string
}

interface Event {
  id: string
  slug: string
  name: string
  description: string
  event_type: string
  status: string
  start_date: string
  end_date: string
  section: Section
  config: any
  hero_config: any
}

interface Product {
  id: string
  name: string
  description: string
  price_cents: number
  product_type: string
  stock: number | null
  is_active: boolean
  sort_order: number
  image_url?: string
  allergens?: string[]
  is_vegetarian?: boolean
  is_vegan?: boolean
  // Wine-specific fields
  is_wine?: boolean
  vintage?: string
  color?: string
  aromas?: string
  balance?: string
  food_pairings?: string
  conservation?: string
  grape_variety?: string
  wine_type?: string
  appellation?: string
  special_mentions?: string[]
  residual_sugar_gl?: number | null
  limited_stock?: boolean
  highlight_badge?: string
  producer?: string
  origin?: string
}

interface Slot {
  id: string
  date: string
  start_time: string
  end_time: string
  capacity: number
}

interface Order {
  id: string
  code: string
  customer_name: string
  status: string
  total_cents: number
  created_at: string
}

interface MobileEventDetailProps {
  event: Event
  products: Product[]
  slots: Slot[]
  orders: Order[]
  onEditEvent: () => void
  onDeleteEvent: () => void
  onAddProduct: () => void
  onEditProduct: (product: Product) => void
  onAddSlot: () => void
  onExportOrders: () => void
}

export default function MobileEventDetail({
  event,
  products,
  slots,
  orders,
  onEditEvent,
  onDeleteEvent,
  onAddProduct,
  onEditProduct,
  onAddSlot,
  onExportOrders,
}: MobileEventDetailProps) {
  const router = useRouter()

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2) + ' €'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
      ACTIVE: { label: 'Actif', color: 'bg-green-100 text-green-700' },
      CLOSED: { label: 'Fermé', color: 'bg-red-100 text-red-700' },
    }
    return badges[status as keyof typeof badges] || badges.DRAFT
  }

  const getOrderStatusBadge = (status: string) => {
    const badges = {
      PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500' },
      PAID: { label: 'Payé', color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-500' },
      PREPARED: { label: 'Préparé', color: 'bg-purple-100 text-purple-700', dotColor: 'bg-purple-500' },
      DELIVERED: { label: 'Livré', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
      CANCELLED: { label: 'Annulé', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500' },
    }
    return badges[status as keyof typeof badges] || badges.PENDING
  }

  const statusBadge = getStatusBadge(event.status)
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_cents, 0)

  return (
    <MobileAdminLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 pt-4 pb-3">
          <button
            onClick={() => router.push('/admin/events')}
            className="flex items-center gap-2 text-gray-600 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour</span>
          </button>

          <div
            className="h-1 rounded-full mb-3"
            style={{ backgroundColor: event.section.color }}
          />

          <h1 className="text-xl font-bold text-gray-900 mb-1">{event.name}</h1>
          <p className="text-sm text-gray-600 mb-2">{event.section.name}</p>

          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(event.start_date)} → {formatDate(event.end_date)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onEditEvent}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium active:bg-gray-200"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            <button
              onClick={onDeleteEvent}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium active:bg-red-100"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-gray-200 border-t border-gray-200">
          <div className="bg-white p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{products.length}</p>
            <p className="text-xs text-gray-500">Produits</p>
          </div>
          <div className="bg-white p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{orders.length}</p>
            <p className="text-xs text-gray-500">Commandes</p>
          </div>
          <div className="bg-white p-3 text-center">
            <p className="text-lg font-bold text-green-600">{formatPrice(totalRevenue)}</p>
            <p className="text-xs text-gray-500">Revenus</p>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="p-4 space-y-4">
        {/* Products Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Produits ({products.length})</h2>
            <button
              onClick={onAddProduct}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#003f5c] text-white rounded-lg text-sm font-medium active:bg-[#2f6690]"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Aucun produit</p>
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => onEditProduct(product)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-3 text-left active:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(product.price_cents)}
                        </span>
                        {product.stock !== null && (
                          <span className="text-xs text-gray-500">
                            Stock: {product.stock}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-xs ${
                      product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {product.is_active ? 'Actif' : 'Inactif'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Slots Section (only for MEAL events) */}
        {event.event_type === 'MEAL' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Créneaux ({slots.length})</h2>
              <button
                onClick={onAddSlot}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#003f5c] text-white rounded-lg text-sm font-medium active:bg-[#2f6690]"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>

            {slots.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Aucun créneau</p>
              </div>
            ) : (
              <div className="space-y-2">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="bg-white border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {formatDate(slot.date)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {slot.start_time} - {slot.end_time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{slot.capacity}</p>
                        <p className="text-xs text-gray-500">places</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Commandes ({orders.length})</h2>
            {orders.length > 0 && (
              <button
                onClick={onExportOrders}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium active:bg-gray-200"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Aucune commande</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map((order) => {
                const orderStatusBadge = getOrderStatusBadge(order.status)
                return (
                  <button
                    key={order.id}
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-3 text-left active:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {/* Status indicator dot */}
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${orderStatusBadge.dotColor}`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900 text-sm truncate pr-2">{order.customer_name}</p>
                          <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                            {formatPrice(order.total_cents)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs text-gray-500">#{order.code}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${orderStatusBadge.color}`}>
                            {orderStatusBadge.label}
                          </span>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('fr-BE')}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </button>
                )
              })}
              {orders.length > 5 && (
                <p className="text-xs text-center text-gray-500 py-2">
                  +{orders.length - 5} autres commandes
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </MobileAdminLayout>
  )
}
