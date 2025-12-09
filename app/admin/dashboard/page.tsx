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
import MobileEventDashboard from '@/components/admin/mobile/MobileEventDashboard'
import EventDashboard from '@/components/admin/EventDashboard'
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
    return <MobileEventDashboard events={events} />
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
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Statistiques détaillées par événement
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003f5c]"></div>
            </div>
          ) : (
            <EventDashboard events={events} />
          )}

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
