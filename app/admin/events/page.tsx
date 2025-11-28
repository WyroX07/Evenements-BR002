'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useIsMobile } from '@/hooks/useIsMobile'
import MobileEvents from '@/components/admin/mobile/MobileEvents'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { Calendar, Plus, ChevronRight } from 'lucide-react'

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

export default function EventsPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [events, setEvents] = useState<Event[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterSection, setFilterSection] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      const [eventsRes, sectionsRes] = await Promise.all([
        fetch('/api/admin/events'),
        fetch('/api/sections'),
      ])

      if (!eventsRes.ok) {
        if (eventsRes.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Erreur de chargement')
      }

      const eventsData = await eventsRes.json()
      const sectionsData = await sectionsRes.json()

      setEvents(eventsData.events || [])
      setSections(sectionsData.sections || [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(0) + ' €'
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
      ACTIVE: { label: 'Actif', color: 'bg-green-100 text-green-700' },
      CLOSED: { label: 'Fermé', color: 'bg-red-100 text-red-700' },
    }
    return badges[status as keyof typeof badges] || badges.DRAFT
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'PRODUCT_SALE': return 'Vente'
      case 'MEAL': return 'Souper'
      case 'RAFFLE': return 'Tombola'
      default: return type
    }
  }

  const filteredEvents = events.filter((event) => {
    if (filterSection !== 'all' && event.section.id !== filterSection) return false
    if (filterStatus !== 'all' && event.status !== filterStatus) return false
    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003f5c]"></div>
      </div>
    )
  }

  // Mobile version
  if (isMobile) {
    return <MobileEvents events={events} sections={sections} />
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
                <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Gérer tous les événements
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/events/new')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#003f5c] text-white rounded-lg hover:bg-[#2f6690] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouvel événement
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title & Filters */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#003f5c]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
                <p className="text-sm text-gray-600">
                  {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Toutes les sections</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="DRAFT">Brouillon</option>
              <option value="ACTIVE">Actif</option>
              <option value="CLOSED">Fermé</option>
            </select>
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun événement
            </h3>
            <p className="text-gray-600 mb-6">
              Créez votre premier événement pour commencer
            </p>
            <button
              onClick={() => router.push('/admin/events/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#003f5c] text-white rounded-lg hover:bg-[#2f6690] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Créer un événement
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Événement
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEvents.map((event) => {
                  const statusBadge = getStatusBadge(event.status)
                  return (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-1 h-12 rounded-full"
                            style={{ backgroundColor: event.section.color }}
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{event.name}</p>
                            <p className="text-sm text-gray-500">{event.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{event.section.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {getEventTypeLabel(event.event_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <div>{formatDate(event.start_date)}</div>
                          <div className="text-xs text-gray-400">→ {formatDate(event.end_date)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3 justify-center text-xs">
                          <div className="text-center">
                            <div className="font-bold text-gray-900">{event.stats.ordersCount}</div>
                            <div className="text-gray-500">cmdes</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-green-600">{formatPrice(event.stats.totalRevenueCents)}</div>
                            <div className="text-gray-500">€</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => router.push(`/admin/events/${event.id}`)}
                          className="inline-flex items-center gap-2 text-sm text-[#003f5c] hover:text-[#2f6690] font-medium"
                        >
                          Gérer
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        </main>
      </div>
    </AdminLayout>
  )
}
