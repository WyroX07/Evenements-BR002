'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronRight, Filter, Plus } from 'lucide-react'
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

interface MobileEventsProps {
  events: Event[]
  sections: Section[]
}

export default function MobileEvents({ events, sections }: MobileEventsProps) {
  const router = useRouter()
  const [filterSection, setFilterSection] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'short',
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

  return (
    <MobileAdminLayout>
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-[#003f5c] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Create Button */}
        <button
          onClick={() => router.push('/admin/events/new')}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#003f5c] text-white rounded-lg font-medium active:bg-[#2f6690] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvel événement
        </button>
      </div>

      {/* Filters Drawer */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 px-4 py-4 space-y-3 animate-slideDown">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Section</label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Toutes les sections</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="DRAFT">Brouillon</option>
              <option value="ACTIVE">Actif</option>
              <option value="CLOSED">Fermé</option>
            </select>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="px-4 pt-4 pb-6 space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium mb-2">Aucun événement</p>
            <p className="text-sm text-gray-400">Créez votre premier événement</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const statusBadge = getStatusBadge(event.status)
            return (
              <div
                key={event.id}
                onClick={() => router.push(`/admin/events/${event.id}`)}
                className="bg-white rounded-2xl shadow-sm active:shadow-md transition-all active:scale-[0.98] overflow-hidden"
              >
                {/* Section Color Bar */}
                <div
                  className="h-1"
                  style={{ backgroundColor: event.section.color }}
                />

                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">
                        {event.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getEventTypeLabel(event.event_type)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                  </div>

                  {/* Section & Dates */}
                  <div className="text-xs text-gray-600 mb-3 space-y-1">
                    <div>{event.section.name}</div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(event.start_date)} → {formatDate(event.end_date)}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-lg font-bold text-amber-600">{event.stats.productsCount}</p>
                      <p className="text-[10px] text-gray-500">Produits</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{event.stats.slotsCount}</p>
                      <p className="text-[10px] text-gray-500">Créneaux</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{event.stats.ordersCount}</p>
                      <p className="text-[10px] text-gray-500">Cmdes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-600">{formatPrice(event.stats.totalRevenueCents)}</p>
                      <p className="text-[10px] text-gray-500">Revenus</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </MobileAdminLayout>
  )
}
