'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  ShoppingBag,
  Package,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  Eye
} from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import MobileDashboard from '@/components/admin/mobile/MobileDashboard'
import AdminLayout from '@/components/admin/AdminLayout'

interface Section {
  id: string
  name: string
  slug: string
  color: string
}

interface Event {
  id: string
  slug: string
  name: string
  event_type: 'PRODUCT_SALE' | 'MEAL' | 'RAFFLE'
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED'
  start_date: string
  end_date: string
  section: Section
  stats: {
    productsCount: number
    slotsCount: number
    ordersCount: number
    totalRevenueCents: number
  }
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const eventsRes = await fetch('/api/admin/events')

      if (!eventsRes.ok) {
        if (eventsRes.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Erreur de chargement')
      }

      const eventsData = await eventsRes.json()
      setEvents(eventsData.events || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(0) + ' €'
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

  // Calculate global stats
  const globalStats = {
    totalEvents: events.length,
    activeEvents: events.filter(e => e.status === 'ACTIVE').length,
    totalOrders: events.reduce((sum, e) => sum + e.stats.ordersCount, 0),
    totalRevenue: events.reduce((sum, e) => sum + e.stats.totalRevenueCents, 0),
  }

  // Get recent events (last 5)
  const recentEvents = events
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    .slice(0, 5)

  // Mobile version
  if (isMobile) {
    return <MobileDashboard onCreateEvent={() => router.push('/admin/events')} />
  }

  // Desktop version
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Statistiques globales de tous les événements
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Global Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Événements</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {globalStats.totalEvents}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {globalStats.activeEvents} actif{globalStats.activeEvents > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Commandes</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {globalStats.totalOrders}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Toutes sections
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Revenus</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatPrice(globalStats.totalRevenue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Total généré
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Moyenne / Event</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {events.length > 0 ? formatPrice(globalStats.totalRevenue / events.length) : '0 €'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Revenu moyen
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Événements récents</h2>
                <Link
                  href="/admin/events"
                  className="text-sm font-medium text-[#003f5c] hover:text-[#2f6690] flex items-center gap-1"
                >
                  Voir tous
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003f5c] mx-auto"></div>
              </div>
            ) : recentEvents.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun événement
                </h3>
                <p className="text-gray-600 mb-6">
                  Commencez par créer votre premier événement
                </p>
                <Link
                  href="/admin/events"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#003f5c] text-white rounded-lg hover:bg-[#2f6690] transition-colors"
                >
                  Gérer les événements
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentEvents.map((event) => {
                  const statusBadge = getStatusBadge(event.status)
                  return (
                    <Link
                      key={event.id}
                      href={`/admin/events/${event.id}`}
                      className="block p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Color indicator */}
                        <div
                          className="w-1 h-16 rounded-full flex-shrink-0"
                          style={{ backgroundColor: event.section.color }}
                        />

                        {/* Event info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              {event.name}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color} flex-shrink-0`}>
                              {statusBadge.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{event.section.name}</span>
                            <span>•</span>
                            <span>{formatDate(event.start_date)} → {formatDate(event.end_date)}</span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="hidden md:flex items-center gap-8 flex-shrink-0">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{event.stats.ordersCount}</div>
                            <div className="text-xs text-gray-500">Commandes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{formatPrice(event.stats.totalRevenueCents)}</div>
                            <div className="text-xs text-gray-500">Revenus</div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <ArrowUpRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/admin/events"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Gérer les événements</h3>
                  <p className="text-sm text-gray-600">Créer et modifier des événements</p>
                </div>
                <Calendar className="w-8 h-8 text-[#003f5c] group-hover:scale-110 transition-transform" />
              </div>
            </Link>

            <Link
              href="/admin/orders"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Voir les commandes</h3>
                  <p className="text-sm text-gray-600">Consulter toutes les commandes</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-[#003f5c] group-hover:scale-110 transition-transform" />
              </div>
            </Link>

            <Link
              href="/admin/search"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Rechercher</h3>
                  <p className="text-sm text-gray-600">Trouver une commande rapidement</p>
                </div>
                <Eye className="w-8 h-8 text-[#003f5c] group-hover:scale-110 transition-transform" />
              </div>
            </Link>
          </div>
        </main>
      </div>
    </AdminLayout>
  )
}
