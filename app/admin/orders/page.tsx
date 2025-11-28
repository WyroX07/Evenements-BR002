'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Filter, X, Loader2, ChevronRight } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useIsMobile } from '@/hooks/useIsMobile'
import MobileAdminLayout from '@/components/admin/mobile/MobileAdminLayout'

interface Order {
  id: string
  code: string
  customer_name: string
  status: string
  total_cents: number
  created_at: string
  delivery_type: string
  event: {
    id: string
    name: string
  }
}

interface Event {
  id: string
  name: string
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [orders, setOrders] = useState<Order[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [eventFilter, setEventFilter] = useState<string>('')

  useEffect(() => {
    fetchOrders()
    fetchEvents()
  }, [statusFilter, eventFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/orders'
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (eventFilter) params.append('event_id', eventFilter)
      if (params.toString()) url += `?${params.toString()}`

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(2)} €`
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
      PAID: { label: 'Payé', color: 'bg-blue-100 text-blue-700' },
      PREPARED: { label: 'Préparé', color: 'bg-purple-100 text-purple-700' },
      DELIVERED: { label: 'Livré', color: 'bg-green-100 text-green-700' },
      CANCELLED: { label: 'Annulé', color: 'bg-red-100 text-red-700' },
    }
    return badges[status as keyof typeof badges] || badges.PENDING
  }

  const activeFiltersCount = (statusFilter ? 1 : 0) + (eventFilter ? 1 : 0)

  const content = (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Toutes les commandes</h1>
              <p className="mt-1 text-sm text-gray-500">
                {orders.length} commande{orders.length > 1 ? 's' : ''}
                {activeFiltersCount > 0 && ` (${activeFiltersCount} filtre${activeFiltersCount > 1 ? 's' : ''})`}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#003f5c] focus:border-transparent rounded-lg"
                >
                  <option value="">Tous les statuts</option>
                  <option value="PENDING">En attente</option>
                  <option value="PAID">Payé</option>
                  <option value="PREPARED">Préparé</option>
                  <option value="DELIVERED">Livré</option>
                  <option value="CANCELLED">Annulé</option>
                </select>
                {statusFilter && (
                  <button
                    onClick={() => setStatusFilter('')}
                    className="absolute inset-y-0 right-8 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Event Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Événement
              </label>
              <div className="relative">
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#003f5c] focus:border-transparent rounded-lg"
                >
                  <option value="">Tous les événements</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
                {eventFilter && (
                  <button
                    onClick={() => setEventFilter('')}
                    className="absolute inset-y-0 right-8 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setStatusFilter('')
                setEventFilter('')
              }}
              className="mt-3 text-sm text-[#003f5c] hover:text-[#2f6690] font-medium"
            >
              Effacer tous les filtres
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#003f5c]" />
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Filter className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeFiltersCount > 0
                ? 'Aucune commande ne correspond aux filtres sélectionnés'
                : 'Aucune commande n\'a encore été créée'}
            </p>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Événement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const statusBadge = getStatusBadge(order.status)
                  return (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">#{order.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.customer_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {order.event.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('fr-BE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                        {formatPrice(order.total_cents)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return <MobileAdminLayout>{content}</MobileAdminLayout>
  }

  return <AdminLayout>{content}</AdminLayout>
}
