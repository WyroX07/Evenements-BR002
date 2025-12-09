'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Package,
  ShoppingBag,
  ChevronDown,
  Wine,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
} from 'lucide-react'
import MobileAdminLayout from './MobileAdminLayout'

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

interface MobileEventDashboardProps {
  events: Event[]
  selectedEventId?: string
  onEventChange?: (eventId: string) => void
}

export default function MobileEventDashboard({
  events,
  selectedEventId,
  onEventChange
}: MobileEventDashboardProps) {
  const [currentEventId, setCurrentEventId] = useState<string | null>(
    selectedEventId || (events.length > 0 ? events[0].id : null)
  )
  const [stats, setStats] = useState<EventStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

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

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  if (!currentEvent) {
    return (
      <MobileAdminLayout>
        <div className="text-center py-12 px-4">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun événement
          </h3>
          <p className="text-gray-600">
            Créez un événement pour voir les statistiques
          </p>
        </div>
      </MobileAdminLayout>
    )
  }

  return (
    <MobileAdminLayout>
      {/* Header & Event Selector */}
      <div className="bg-white px-4 pt-4 pb-6 border-b border-gray-200">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-500 text-sm mt-0.5">Vue détaillée par événement</p>
        </div>

        {/* Event Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between active:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentEvent.section.color }}
              />
              <div className="text-left">
                <p className="font-semibold text-gray-900 text-sm">{currentEvent.name}</p>
                <p className="text-xs text-gray-500">{currentEvent.section.name}</p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => handleEventChange(event.id)}
                  className={`w-full px-4 py-3 flex items-center gap-3 active:bg-gray-50 transition-colors ${
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
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003f5c]"></div>
        </div>
      ) : stats ? (
        <div className="px-4 py-6 space-y-6">
          {/* Global Stats Cards - Horizontal Scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <div className="bg-white border border-gray-200 rounded-xl p-4 min-w-[140px] flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-xs text-gray-600">Commandes</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 min-w-[140px] flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(stats.totalRevenueCents)}
              </p>
              <p className="text-xs text-gray-600">Chiffre d'affaires</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 min-w-[140px] flex-shrink-0">
              <Package className="w-5 h-5 text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              <p className="text-xs text-gray-600">Produits vendus</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 min-w-[140px] flex-shrink-0">
              <DollarSign className="w-5 h-5 text-amber-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(stats.averageOrderValue)}
              </p>
              <p className="text-xs text-gray-600">Panier moyen</p>
            </div>
          </div>

          {/* Revenue Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
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

          {/* Supplier Stats */}
          {stats.supplierStats.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Wine className="w-5 h-5 text-[#003f5c]" />
                Revenus par fournisseur
              </h3>
              <div className="space-y-3">
                {stats.supplierStats.map((supplier, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{supplier.supplier}</p>
                      <p className="text-xs text-gray-500">
                        {supplier.total_quantity} btl • {supplier.products_count} produit
                        {supplier.products_count > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="font-bold text-gray-900 text-sm">
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

          {/* Product Stats - Expandable */}
          {stats.productStats.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200">
              <button
                onClick={() => toggleSection('products')}
                className="w-full px-4 py-4 flex items-center justify-between active:bg-gray-50 transition-colors"
              >
                <h3 className="text-base font-semibold text-gray-900">
                  CA par produit ({stats.productStats.length})
                </h3>
                <ChevronRight
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedSection === 'products' ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {expandedSection === 'products' && (
                <div className="px-4 pb-4 space-y-2">
                  {stats.productStats.map((product, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{product.product_name}</p>
                          {product.producer && (
                            <p className="text-xs text-gray-500">{product.producer}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="font-bold text-gray-900 text-sm">
                            {formatPrice(product.total_revenue_cents)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatPercent(product.total_revenue_cents, stats.totalRevenueCents)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>{formatPrice(product.unit_price_cents)} / unité</span>
                        <span>•</span>
                        <span>{product.total_quantity} vendus</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Order Breakdown - Expandable */}
          <div className="bg-white rounded-xl border border-gray-200">
            <button
              onClick={() => toggleSection('breakdown')}
              className="w-full px-4 py-4 flex items-center justify-between active:bg-gray-50 transition-colors"
            >
              <h3 className="text-base font-semibold text-gray-900">
                Répartition des commandes
              </h3>
              <ChevronRight
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedSection === 'breakdown' ? 'rotate-90' : ''
                }`}
              />
            </button>
            {expandedSection === 'breakdown' && (
              <div className="px-4 pb-4 space-y-4">
                {/* Status */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Par statut</h4>
                  <div className="space-y-2">
                    {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{status}</span>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Type */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Type de livraison</h4>
                  <div className="space-y-2">
                    {Object.entries(stats.ordersByDeliveryType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{type}</span>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Méthode de paiement</h4>
                  <div className="space-y-2">
                    {Object.entries(stats.ordersByPaymentMethod).map(([method, count]) => (
                      <div key={method} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{method}</span>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 px-4">
          <p className="text-gray-500">Aucune statistique disponible</p>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </MobileAdminLayout>
  )
}
