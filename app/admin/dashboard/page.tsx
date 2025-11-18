'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Calendar,
  ShoppingBag,
  Users,
  Package,
  Filter,
  LogOut,
  BarChart3,
  Tag
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import EventForm, { EventFormValues } from '@/components/forms/EventForm'
import { useToast } from '@/contexts/ToastContext'

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
  const { addToast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterSection, setFilterSection] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Modal states
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Fetch events
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

      // Fetch sections
      const sectionsRes = await fetch('/api/sections')
      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json()
        setSections(sectionsData.sections || [])
      }
    } catch (err) {
      setError('Erreur de chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  // Event handlers
  const handleCreateEvent = async (values: EventFormValues) => {
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        const data = await res.json()
        setEvents([...events, data.event])
        setIsEventModalOpen(false)
        addToast('Événement créé avec succès', 'success')
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de création')
      }
    } catch (err: any) {
      addToast(err.message || 'Erreur de création', 'error')
      throw err
    }
  }

  const handleUpdateEvent = async (values: EventFormValues) => {
    if (!editingEvent) return

    try {
      const res = await fetch(`/api/admin/events/${editingEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        const data = await res.json()
        setEvents(events.map(e => e.id === editingEvent.id ? data.event : e))
        setIsEventModalOpen(false)
        setEditingEvent(null)
        addToast('Événement mis à jour avec succès', 'success')
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de mise à jour')
      }
    } catch (err: any) {
      addToast(err.message || 'Erreur de mise à jour', 'error')
      throw err
    }
  }

  const openEventModal = (event?: Event) => {
    setEditingEvent(event || null)
    setIsEventModalOpen(true)
  }

  const closeEventModal = () => {
    setEditingEvent(null)
    setIsEventModalOpen(false)
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
      ACTIVE: { label: 'Actif', color: 'bg-green-100 text-green-800' },
      CLOSED: { label: 'Fermé', color: 'bg-red-100 text-red-800' },
    }
    const badge = badges[status as keyof typeof badges] || badges.DRAFT
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'PRODUCT_SALE': return 'Vente'
      case 'MEAL': return 'Souper'
      case 'RAFFLE': return 'Tombola'
      default: return type
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

  // Filter events
  const filteredEvents = events.filter((event) => {
    if (filterSection !== 'all' && event.section.id !== filterSection) return false
    if (filterStatus !== 'all' && event.status !== filterStatus) return false
    return true
  })

  // Calculate global stats
  const globalStats = {
    totalEvents: events.length,
    activeEvents: events.filter(e => e.status === 'ACTIVE').length,
    totalOrders: events.reduce((sum, e) => sum + e.stats.ordersCount, 0),
    totalRevenue: events.reduce((sum, e) => sum + e.stats.totalRevenueCents, 0),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Admin
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestion des événements multi-sections
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/promo-codes">
                <Button variant="secondary" size="sm">
                  <Tag className="w-4 h-4 mr-2" />
                  Codes promo
                </Button>
              </Link>
              <Link href="/">
                <Button variant="secondary" size="sm">
                  Voir le site
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total événements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalStats.totalEvents}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-amber-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Événements actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {globalStats.activeEvents}
                </p>
              </div>
              <BarChart3 className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total commandes</p>
                <p className="text-2xl font-bold text-blue-600">
                  {globalStats.totalOrders}
                </p>
              </div>
              <ShoppingBag className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Revenus totaux</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatPrice(globalStats.totalRevenue)}
                </p>
              </div>
              <Package className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />

              {/* Section Filter */}
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Toutes les sections</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="DRAFT">Brouillon</option>
                <option value="ACTIVE">Actif</option>
                <option value="CLOSED">Fermé</option>
              </select>
            </div>

            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => openEventModal()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvel événement
            </Button>
          </div>
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error}</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun événement trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Créez votre premier événement pour commencer
            </p>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => openEventModal()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un événement
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div
                  className="h-1 rounded-t-lg"
                  style={{ backgroundColor: event.section.color }}
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {event.name}
                        </h3>
                        {getStatusBadge(event.status)}
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {getEventTypeLabel(event.event_type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.section.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(event.start_date)} → {formatDate(event.end_date)}
                        </span>
                      </div>
                    </div>
                    <Link href={`/admin/events/${event.id}`}>
                      <Button variant="secondary" size="sm">
                        Gérer
                      </Button>
                    </Link>
                  </div>

                  {/* Event Stats */}
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-600">
                        {event.stats.productsCount}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Produits</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {event.stats.slotsCount}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Créneaux</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {event.stats.ordersCount}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Commandes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {formatPrice(event.stats.totalRevenueCents)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Revenus</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={closeEventModal}
        title={editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
      >
        <EventForm
          initialValues={
            editingEvent
              ? {
                  name: editingEvent.name,
                  slug: editingEvent.slug,
                  description: '',
                  start_date: editingEvent.start_date,
                  end_date: editingEvent.end_date,
                  section_id: editingEvent.section.id,
                  status: editingEvent.status,
                  hero_image_url: '',
                  hero_title: editingEvent.name,
                  hero_subtitle: '',
                  hero_show_stats: true,
                  hero_cta_text: 'Commander maintenant',
                }
              : undefined
          }
          onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
          onCancel={closeEventModal}
          sections={sections}
          submitText={editingEvent ? 'Mettre à jour' : 'Créer'}
        />
      </Modal>
    </div>
  )
}
