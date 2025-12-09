'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Percent,
  Users,
  ChevronDown,
  Wine,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface Event {
  id: string
  name: string
  slug: string
  event_type: string
  status: string
  section: {
    id: string
    name: string
    slug: string
    color: string
  }
}

interface ProductStats {
  product_id: string
  product_name: string
  producer: string | null
  total_quantity: number
  total_revenue_cents: number
  unit_price_cents: number
}

interface SupplierStats {
  supplier: string
  total_revenue_cents: number
  total_quantity: number
  products_count: number
}

interface EventStats {
  totalOrders: number
  totalRevenueCents: number
  totalItems: number
  averageOrderValue: number
  averageItemsPerOrder: number
  ordersByStatus: Record<string, number>
  ordersByDeliveryType: Record<string, number>
  ordersByPaymentMethod: Record<string, number>
  revenue: {
    subtotal_cents: number
    discount_cents: number
    delivery_fees_cents: number
    total_cents: number
  }
  productStats: ProductStats[]
  supplierStats: SupplierStats[]
}

interface EventDashboardProps {
  events: Event[]
  selectedEventId?: string
  onEventChange?: (eventId: string) => void
}

export default function EventDashboard({
  events,
  selectedEventId,
  onEventChange
}: EventDashboardProps) {
  const [currentEventId, setCurrentEventId] = useState<string | null>(
    selectedEventId || (events.length > 0 ? events[0].id : null)
  )
  const [stats, setStats] = useState<EventStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const currentEvent = events.find(e => e.id === currentEventId)

  useEffect(() => {
    if (currentEventId) {
      fetchEventStats(currentEventId)
    }
  }, [currentEventId])

  const fetchEventStats = async (eventId: string) => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/events/${eventId}/stats`)

      if (!res.ok) {
        throw new Error('Erreur de chargement des stats')
      }

      const data = await res.json()
      setStats(data.stats)
    } catch (err) {
      console.error('Error fetching event stats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEventChange = (eventId: string) => {
    setCurrentEventId(eventId)
    setIsDropdownOpen(false)
    if (onEventChange) {
      onEventChange(eventId)
    }
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(0) + ' €'
  }

  const formatPercent = (value: number, total: number) => {
    if (total === 0) return '0%'
    return ((value / total) * 100).toFixed(0) + '%'
  }

  if (!currentEvent) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucun événement
        </h3>
        <p className="text-gray-600">
          Créez un événement pour voir les statistiques
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Event Selector */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Événement sélectionné
        </label>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between hover:border-gray-400 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentEvent.section.color }}
            />
            <div className="text-left">
              <p className="font-semibold text-gray-900">{currentEvent.name}</p>
              <p className="text-sm text-gray-500">{currentEvent.section.name}</p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => handleEventChange(event.id)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  event.id === currentEventId ? 'bg-blue-50' : ''
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: event.section.color }}
                />
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 text-sm">{event.name}</p>
                  <p className="text-xs text-gray-500">{event.section.name}</p>
                </div>
                {event.id === currentEventId && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003f5c]"></div>
        </div>
      ) : stats ? (
        <>
          {/* Global Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-sm text-gray-600">Commandes</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">CA</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(stats.totalRevenueCents)}
              </p>
              <p className="text-sm text-gray-600">Chiffre d'affaires</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">Articles</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              <p className="text-sm text-gray-600">Produits vendus</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">Panier moy.</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(stats.averageOrderValue)}
              </p>
              <p className="text-sm text-gray-600">Par commande</p>
            </div>
          </div>

          {/* Revenue Breakdown & Suppliers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#003f5c]" />
                Détail des revenus
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sous-total produits</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(stats.revenue.subtotal_cents)}
                  </span>
                </div>
                {stats.revenue.discount_cents > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                      Remises
                    </span>
                    <span className="font-semibold text-red-600">
                      -{formatPrice(stats.revenue.discount_cents)}
                    </span>
                  </div>
                )}
                {stats.revenue.delivery_fees_cents > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                      Frais de livraison
                    </span>
                    <span className="font-semibold text-green-600">
                      +{formatPrice(stats.revenue.delivery_fees_cents)}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-[#003f5c]">
                      {formatPrice(stats.revenue.total_cents)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Supplier Stats (for wine sales) */}
            {stats.supplierStats.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wine className="w-5 h-5 text-[#003f5c]" />
                  Revenus par fournisseur
                </h3>
                <div className="space-y-3">
                  {stats.supplierStats.map((supplier, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{supplier.supplier}</p>
                        <p className="text-xs text-gray-500">
                          {supplier.total_quantity} bouteilles • {supplier.products_count} produit
                          {supplier.products_count > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatPrice(supplier.total_revenue_cents)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatPercent(supplier.total_revenue_cents, stats.totalRevenueCents)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Stats */}
          {stats.productStats.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chiffre d'affaires par produit
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Produit
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Fournisseur
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Prix unitaire
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Quantité
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        CA total
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        % du CA
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.productStats.map((product, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{product.product_name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {product.producer || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right">
                          {formatPrice(product.unit_price_cents)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                          {product.total_quantity}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                          {formatPrice(product.total_revenue_cents)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 text-right">
                          {formatPercent(product.total_revenue_cents, stats.totalRevenueCents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Order Status & Delivery Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Par statut</h3>
              <div className="space-y-2">
                {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{status}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Type */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Type de livraison</h3>
              <div className="space-y-2">
                {Object.entries(stats.ordersByDeliveryType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{type}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Méthode de paiement</h3>
              <div className="space-y-2">
                {Object.entries(stats.ordersByPaymentMethod).map(([method, count]) => (
                  <div key={method} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{method}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune statistique disponible</p>
        </div>
      )}
    </div>
  )
}
