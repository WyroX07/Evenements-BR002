'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar, ShoppingBag, Package, TrendingUp, Tag, QrCode } from 'lucide-react'
import MobileAdminLayout from './MobileAdminLayout'

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

interface MobileDashboardProps {
  onCreateEvent?: () => void
}

export default function MobileDashboard({ onCreateEvent }: MobileDashboardProps) {
  const router = useRouter()
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
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(0) + ' €'
  }

  const globalStats = {
    totalEvents: events.length,
    activeEvents: events.filter(e => e.status === 'ACTIVE').length,
    totalOrders: events.reduce((sum, e) => sum + e.stats.ordersCount, 0),
    totalRevenue: events.reduce((sum, e) => sum + e.stats.totalRevenueCents, 0),
  }

  if (isLoading) {
    return (
      <MobileAdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003f5c]"></div>
        </div>
      </MobileAdminLayout>
    )
  }

  const recentEvents = events.slice(0, 3)

  return (
    <MobileAdminLayout>
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-6 border-b border-gray-200">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Vue d'ensemble</p>
        </div>

        {/* Stats Cards - Horizontal Scroll */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 min-w-[130px] flex-shrink-0">
            <Calendar className="w-5 h-5 text-[#003f5c] mb-2" />
            <p className="text-2xl font-bold text-gray-900">{globalStats.totalEvents}</p>
            <p className="text-xs text-gray-600">Événements</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 min-w-[130px] flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{globalStats.activeEvents}</p>
            <p className="text-xs text-gray-600">Actifs</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 min-w-[130px] flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{globalStats.totalOrders}</p>
            <p className="text-xs text-gray-600">Commandes</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 min-w-[130px] flex-shrink-0">
            <Package className="w-5 h-5 text-amber-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{formatPrice(globalStats.totalRevenue)}</p>
            <p className="text-xs text-gray-600">Revenus</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pt-6 pb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Actions rapides</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/admin/events')}
            className="bg-white border border-gray-200 rounded-xl p-4 active:bg-gray-50 transition-colors text-left"
          >
            <Calendar className="w-6 h-6 text-[#003f5c] mb-2" />
            <p className="font-medium text-gray-900 text-sm">Événements</p>
            <p className="text-xs text-gray-500 mt-0.5">Gérer les événements</p>
          </button>
          <button
            onClick={() => router.push('/admin/promo-codes')}
            className="bg-white border border-gray-200 rounded-xl p-4 active:bg-gray-50 transition-colors text-left"
          >
            <Tag className="w-6 h-6 text-amber-600 mb-2" />
            <p className="font-medium text-gray-900 text-sm">Codes promo</p>
            <p className="text-xs text-gray-500 mt-0.5">Gérer les réductions</p>
          </button>
          <button
            onClick={() => router.push('/admin/scan')}
            className="bg-white border border-gray-200 rounded-xl p-4 active:bg-gray-50 transition-colors text-left"
          >
            <QrCode className="w-6 h-6 text-blue-600 mb-2" />
            <p className="font-medium text-gray-900 text-sm">Scanner</p>
            <p className="text-xs text-gray-500 mt-0.5">Scanner les QR codes</p>
          </button>
          <button
            onClick={onCreateEvent}
            className="bg-[#003f5c] text-white rounded-xl p-4 active:bg-[#2f6690] transition-colors text-left"
          >
            <Plus className="w-6 h-6 mb-2" />
            <p className="font-medium text-sm">Nouveau</p>
            <p className="text-xs text-blue-100 mt-0.5">Créer un événement</p>
          </button>
        </div>
      </div>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div className="px-4 pt-4 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Événements récents</h2>
            <button
              onClick={() => router.push('/admin/events')}
              className="text-xs text-[#003f5c] font-medium"
            >
              Voir tout
            </button>
          </div>
          <div className="space-y-2">
            {recentEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => router.push(`/admin/events/${event.id}`)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 active:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-1 h-10 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.section.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{event.name}</p>
                    <p className="text-xs text-gray-500">{event.section.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">{event.stats.ordersCount}</p>
                    <p className="text-xs text-gray-500">commandes</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
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
