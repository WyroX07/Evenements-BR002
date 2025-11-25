'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Package,
  Calendar,
  ShoppingBag,
  Settings,
  ChevronDown,
  ChevronRight,
  Download
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ProductForm, { ProductFormValues } from '@/components/forms/ProductForm'
import SlotForm, { SlotFormValues } from '@/components/forms/SlotForm'
import BulkSlotGeneratorForm, { BulkSlotParams } from '@/components/forms/BulkSlotGeneratorForm'
import ProductImportModal from '@/components/admin/ProductImportModal'
import { useToast } from '@/contexts/ToastContext'

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
  location: string | null
}

interface Order {
  id: string
  code: string
  customer_name: string
  status: string
  total_cents: number
  created_at: string
  delivery_type: string
}

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const { addToast } = useToast()

  const [event, setEvent] = useState<Event | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'products' | 'slots' | 'orders'>('products')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isProductImportModalOpen, setIsProductImportModalOpen] = useState(false)
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false)
  const [isBulkSlotModalOpen, setIsBulkSlotModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null)

  // Bulk slot selection
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [expandedDates, setExpandedDates] = useState<string[]>([])

  // Orders search and filters
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL')
  const [orderDeliveryTypeFilter, setOrderDeliveryTypeFilter] = useState<string>('ALL')

  useEffect(() => {
    if (eventId) {
      fetchEventData()
    }
  }, [eventId])

  const fetchEventData = async () => {
    try {
      setIsLoading(true)

      // Fetch event details
      const eventRes = await fetch(`/api/admin/events/${eventId}`)
      if (!eventRes.ok) {
        if (eventRes.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Événement non trouvé')
      }
      const eventData = await eventRes.json()
      setEvent(eventData.event)

      // Fetch products
      const productsRes = await fetch(`/api/admin/events/${eventId}/products`)
      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.products || [])
      }

      // Fetch slots
      const slotsRes = await fetch(`/api/admin/events/${eventId}/slots`)
      if (slotsRes.ok) {
        const slotsData = await slotsRes.json()
        setSlots(slotsData.slots || [])
      }

      // Fetch orders for this event
      const ordersRes = await fetch(`/api/admin/orders?event_id=${eventId}`)
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData.orders || [])
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Supprimer ce produit ?')) return

    try {
      const res = await fetch(`/api/admin/events/${eventId}/products?productId=${productId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setProducts(products.filter(p => p.id !== productId))
        addToast('Produit supprimé avec succès', 'success')
      } else {
        const data = await res.json()
        addToast(data.error || 'Erreur de suppression', 'error')
      }
    } catch (err) {
      addToast('Erreur de suppression', 'error')
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Supprimer ce créneau ?')) return

    try {
      const res = await fetch(`/api/admin/events/${eventId}/slots?slotId=${slotId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setSlots(slots.filter(s => s.id !== slotId))
        addToast('Créneau supprimé avec succès', 'success')
      } else {
        const data = await res.json()
        addToast(data.error || 'Erreur de suppression', 'error')
      }
    } catch (err) {
      addToast('Erreur de suppression', 'error')
    }
  }

  const handleDeleteEvent = async () => {
    if (!confirm(`Supprimer définitivement l'événement "${event?.name}" ?\n\nCette action est irréversible.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        addToast('Événement supprimé avec succès', 'success')
        router.push('/admin/dashboard')
      } else {
        const data = await res.json()
        addToast(data.error || 'Erreur de suppression', 'error')
      }
    } catch (err) {
      addToast('Erreur de suppression', 'error')
    }
  }

  // Product handlers
  const handleCreateProduct = async (values: ProductFormValues) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        const data = await res.json()
        setProducts([...products, data.product])
        setIsProductModalOpen(false)
        addToast('Produit créé avec succès', 'success')
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de création')
      }
    } catch (err: any) {
      addToast(err.message || 'Erreur de création', 'error')
      throw err
    }
  }

  const handleUpdateProduct = async (values: ProductFormValues) => {
    if (!editingProduct) return

    try {
      const res = await fetch(`/api/admin/events/${eventId}/products?productId=${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        const data = await res.json()
        setProducts(products.map(p => p.id === editingProduct.id ? data.product : p))
        setIsProductModalOpen(false)
        setEditingProduct(null)
        addToast('Produit mis à jour avec succès', 'success')
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de mise à jour')
      }
    } catch (err: any) {
      addToast(err.message || 'Erreur de mise à jour', 'error')
      throw err
    }
  }

  const openProductModal = (product?: Product) => {
    setEditingProduct(product || null)
    setIsProductModalOpen(true)
  }

  const closeProductModal = () => {
    setEditingProduct(null)
    setIsProductModalOpen(false)
  }

  // Slot handlers
  const handleCreateSlot = async (values: SlotFormValues) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        const data = await res.json()
        setSlots([...slots, data.slot])
        setIsSlotModalOpen(false)
        addToast('Créneau créé avec succès', 'success')
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de création')
      }
    } catch (err: any) {
      addToast(err.message || 'Erreur de création', 'error')
      throw err
    }
  }

  const handleUpdateSlot = async (values: SlotFormValues) => {
    if (!editingSlot) return

    try {
      const res = await fetch(`/api/admin/events/${eventId}/slots?slotId=${editingSlot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        const data = await res.json()
        setSlots(slots.map(s => s.id === editingSlot.id ? data.slot : s))
        setIsSlotModalOpen(false)
        setEditingSlot(null)
        addToast('Créneau mis à jour avec succès', 'success')
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de mise à jour')
      }
    } catch (err: any) {
      addToast(err.message || 'Erreur de mise à jour', 'error')
      throw err
    }
  }

  const openSlotModal = (slot?: Slot) => {
    setEditingSlot(slot || null)
    setIsSlotModalOpen(true)
  }

  const closeSlotModal = () => {
    setEditingSlot(null)
    setIsSlotModalOpen(false)
  }

  // Bulk slot generation handlers
  const handleBulkSlotGeneration = async (params: BulkSlotParams) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/slots/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      if (res.ok) {
        const data = await res.json()
        addToast(`${data.count} créneaux créés avec succès`, 'success')
        setIsBulkSlotModalOpen(false)
        // Rafraîchir les données
        fetchEventData()
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de génération')
      }
    } catch (err: any) {
      addToast(err.message || 'Erreur de génération', 'error')
      throw err
    }
  }

  // Bulk slot selection handlers
  const toggleSlotSelection = (slotId: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    )
  }

  const toggleAllSlots = () => {
    if (selectedSlots.length === slots.length) {
      setSelectedSlots([])
    } else {
      setSelectedSlots(slots.map((s) => s.id))
    }
  }

  const toggleDateSelection = (date: string, dateSlots: Slot[]) => {
    const dateSlotIds = dateSlots.map((s) => s.id)
    const allSelected = dateSlotIds.every((id) => selectedSlots.includes(id))

    if (allSelected) {
      setSelectedSlots((prev) => prev.filter((id) => !dateSlotIds.includes(id)))
    } else {
      setSelectedSlots((prev) => [...new Set([...prev, ...dateSlotIds])])
    }
  }

  const toggleDateExpanded = (date: string) => {
    setExpandedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    )
  }

  const handleBulkDeleteSlots = async () => {
    if (selectedSlots.length === 0) return

    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer ${selectedSlots.length} créneau${
          selectedSlots.length > 1 ? 'x' : ''
        } ?`
      )
    ) {
      return
    }

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/admin/events/${eventId}/slots/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotIds: selectedSlots }),
      })

      if (res.ok) {
        const data = await res.json()
        addToast(data.message, 'success')
        setSelectedSlots([])
        fetchEventData()
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de suppression')
      }
    } catch (err: any) {
      addToast(err.message || 'Erreur de suppression', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportOrders = async () => {
    try {
      const response = await fetch(`/api/admin/orders/export?event_id=${eventId}`)

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export')
      }

      // Télécharger le fichier
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `commandes_${event?.slug || 'export'}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      addToast('Export réussi', 'success')
    } catch (err: any) {
      addToast(err.message || 'Erreur lors de l\'export', 'error')
    }
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2) + ' €'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-BE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      PAID: { label: 'Payée', color: 'bg-green-100 text-green-800' },
      PREPARED: { label: 'Préparée', color: 'bg-blue-100 text-blue-800' },
      DELIVERED: { label: 'Livrée', color: 'bg-purple-100 text-purple-800' },
      CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
    }
    const badge = badges[status as keyof typeof badges] || badges.PENDING
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  // Filter orders based on search and filters
  const filteredOrders = orders.filter((order) => {
    // Search filter
    if (orderSearch) {
      const searchLower = orderSearch.toLowerCase()
      const matchesSearch =
        order.code.toLowerCase().includes(searchLower) ||
        order.customer_name.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    // Status filter
    if (orderStatusFilter !== 'ALL' && order.status !== orderStatusFilter) {
      return false
    }

    // Delivery type filter
    if (orderDeliveryTypeFilter !== 'ALL' && order.delivery_type !== orderDeliveryTypeFilter) {
      return false
    }

    return true
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Événement non trouvé'}</p>
          <Link href="/admin/dashboard">
            <Button variant="secondary">Retour au dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="secondary" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {event.section.name} · {formatDate(event.start_date)} - {formatDate(event.end_date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/event/${event.slug}`} target="_blank">
                <Button variant="secondary" size="sm">
                  Voir la page
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDeleteEvent}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'products'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Produits ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('slots')}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'slots'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Créneaux ({slots.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'orders'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ShoppingBag className="w-4 h-4 inline mr-2" />
                Commandes ({orders.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Produits de l'événement
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsProductImportModalOpen(true)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Import CSV
                    </Button>
                    <Button
                      className="bg-amber-600 hover:bg-amber-700"
                      size="sm"
                      onClick={() => openProductModal()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un produit
                    </Button>
                  </div>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Aucun produit configuré</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-amber-300 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {product.name}
                            </h3>
                            {!product.is_active && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                Inactif
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="font-semibold text-amber-600">
                              {formatPrice(product.price_cents)}
                            </span>
                            {product.stock !== null && (
                              <span>Stock: {product.stock}</span>
                            )}
                            <span className="text-xs">
                              Type: {product.product_type}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openProductModal(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Slots Tab */}
            {activeTab === 'slots' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Créneaux de retrait/dates {slots.length > 0 && `(${slots.length})`}
                  </h2>
                  <div className="flex gap-2">
                    {selectedSlots.length > 0 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleBulkDeleteSlots}
                        disabled={isDeleting}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer ({selectedSlots.length})
                      </Button>
                    )}
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      size="sm"
                      onClick={() => setIsBulkSlotModalOpen(true)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Générer en masse
                    </Button>
                    <Button
                      className="bg-amber-600 hover:bg-amber-700"
                      size="sm"
                      onClick={() => openSlotModal()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un créneau
                    </Button>
                  </div>
                </div>

                {slots.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Aucun créneau configuré</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Selection controls */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedSlots.length === slots.length && slots.length > 0}
                            onChange={toggleAllSlots}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Tout sélectionner
                          </span>
                        </label>
                        <span className="text-sm text-gray-500">
                          {selectedSlots.length} / {slots.length} sélectionné{selectedSlots.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const allDates = Object.keys(
                            slots.reduce((acc, slot) => {
                              acc[slot.date] = true
                              return acc
                            }, {} as Record<string, boolean>)
                          )
                          if (expandedDates.length === allDates.length) {
                            setExpandedDates([])
                          } else {
                            setExpandedDates(allDates)
                          }
                        }}
                      >
                        {expandedDates.length === 0 ? 'Tout déplier' : 'Tout replier'}
                      </Button>
                    </div>

                    {/* Grouped slots by date - Accordion */}
                    <div className="space-y-2">
                      {Object.entries(
                        slots.reduce((acc, slot) => {
                          if (!acc[slot.date]) acc[slot.date] = []
                          acc[slot.date].push(slot)
                          return acc
                        }, {} as Record<string, Slot[]>)
                      )
                        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                        .map(([date, dateSlots]) => {
                          const isExpanded = expandedDates.includes(date)
                          const dateSlotIds = dateSlots.map((s) => s.id)
                          const allDateSelected = dateSlotIds.every((id) => selectedSlots.includes(id))
                          const someSelected = dateSlotIds.some((id) => selectedSlots.includes(id)) && !allDateSelected

                          return (
                            <div key={date} className="border border-gray-200 rounded-lg overflow-hidden">
                              {/* Header - Always visible */}
                              <div className="bg-gray-50 px-4 py-3 flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={allDateSelected}
                                  ref={(el) => {
                                    if (el) el.indeterminate = someSelected
                                  }}
                                  onChange={() => toggleDateSelection(date, dateSlots)}
                                  className="w-4 h-4 text-blue-600 rounded"
                                  title="Sélectionner tous les créneaux de cette date"
                                />
                                <button
                                  onClick={() => toggleDateExpanded(date)}
                                  className="flex-1 flex items-center gap-3 text-left hover:text-blue-600 transition-colors"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-500" />
                                  )}
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{formatDate(date)}</h3>
                                    <p className="text-sm text-gray-600">
                                      {dateSlots.length} créneau{dateSlots.length > 1 ? 'x' : ''}
                                      {dateSlotIds.filter((id) => selectedSlots.includes(id)).length > 0 && (
                                        <span className="ml-2 text-blue-600">
                                          • {dateSlotIds.filter((id) => selectedSlots.includes(id)).length} sélectionné{dateSlotIds.filter((id) => selectedSlots.includes(id)).length > 1 ? 's' : ''}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </button>
                              </div>

                              {/* Content - Collapsible */}
                              {isExpanded && (
                                <div className="divide-y divide-gray-100">
                                  {dateSlots
                                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                    .map((slot) => (
                                      <div
                                        key={slot.id}
                                        className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                                          selectedSlots.includes(slot.id) ? 'bg-blue-50' : ''
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selectedSlots.includes(slot.id)}
                                          onChange={() => toggleSlotSelection(slot.id)}
                                          className="w-4 h-4 text-blue-600 rounded ml-7"
                                        />
                                        <div className="flex-1 grid grid-cols-3 gap-4">
                                          <div>
                                            <p className="text-sm font-medium text-gray-900">
                                              {slot.start_time} - {slot.end_time}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-gray-600">Capacité: {slot.capacity}</p>
                                          </div>
                                          <div>
                                            {slot.location && <p className="text-sm text-gray-600">{slot.location}</p>}
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button variant="secondary" size="sm" onClick={() => openSlotModal(slot)}>
                                            <Edit className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleDeleteSlot(slot.id)}
                                            className="text-red-600 hover:bg-red-50"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Commandes reçues {orders.length > 0 && `(${filteredOrders.length}/${orders.length})`}
                  </h2>
                  {orders.length > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleExportOrders}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exporter CSV
                    </Button>
                  )}
                </div>

                {/* Search and Filters */}
                {orders.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Search */}
                      <div>
                        <label htmlFor="orderSearch" className="block text-sm font-medium text-gray-700 mb-1">
                          Rechercher
                        </label>
                        <input
                          id="orderSearch"
                          type="text"
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                          placeholder="Code ou nom du client..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                          Statut
                        </label>
                        <select
                          id="statusFilter"
                          value={orderStatusFilter}
                          onChange={(e) => setOrderStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="ALL">Tous les statuts</option>
                          <option value="PENDING">En attente</option>
                          <option value="PAID">Payée</option>
                          <option value="PREPARED">Préparée</option>
                          <option value="DELIVERED">Livrée</option>
                          <option value="CANCELLED">Annulée</option>
                        </select>
                      </div>

                      {/* Delivery Type Filter */}
                      <div>
                        <label htmlFor="deliveryTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                          Type de livraison
                        </label>
                        <select
                          id="deliveryTypeFilter"
                          value={orderDeliveryTypeFilter}
                          onChange={(e) => setOrderDeliveryTypeFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="ALL">Tous les types</option>
                          <option value="PICKUP">Retrait</option>
                          <option value="DELIVERY">Livraison</option>
                          <option value="ON_SITE">Sur place</option>
                        </select>
                      </div>
                    </div>

                    {/* Reset filters button */}
                    {(orderSearch || orderStatusFilter !== 'ALL' || orderDeliveryTypeFilter !== 'ALL') && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setOrderSearch('')
                            setOrderStatusFilter('ALL')
                            setOrderDeliveryTypeFilter('ALL')
                          }}
                          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                        >
                          Réinitialiser les filtres
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Aucune commande pour le moment</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                            Code
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                            Client
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                            Statut
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                            Total
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                              Aucune commande ne correspond aux filtres sélectionnés
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <Link
                                href={`/admin/scan/${order.code}`}
                                target="_blank"
                                className="font-mono text-sm text-amber-600 hover:text-amber-700"
                              >
                                {order.code}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {order.customer_name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {order.delivery_type === 'PICKUP' && 'Retrait'}
                              {order.delivery_type === 'DELIVERY' && 'Livraison'}
                              {order.delivery_type === 'ON_SITE' && 'Sur place'}
                            </td>
                            <td className="px-4 py-3">
                              {getStatusBadge(order.status)}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                              {formatPrice(order.total_cents)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {formatDateTime(order.created_at)}
                            </td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={closeProductModal}
        title={editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
        size="lg"
      >
        <ProductForm
          initialValues={editingProduct ? {
            name: editingProduct.name,
            description: editingProduct.description,
            price_cents: editingProduct.price_cents,
            product_type: editingProduct.product_type as any,
            stock: editingProduct.stock,
            is_active: editingProduct.is_active,
            sort_order: editingProduct.sort_order,
            image_url: editingProduct.image_url || '',
            allergens: editingProduct.allergens || [],
            is_vegetarian: editingProduct.is_vegetarian || false,
            is_vegan: editingProduct.is_vegan || false,
            // Wine-specific fields
            is_wine: editingProduct.is_wine || false,
            vintage: editingProduct.vintage || '',
            color: editingProduct.color || '',
            aromas: editingProduct.aromas || '',
            balance: editingProduct.balance || '',
            food_pairings: editingProduct.food_pairings || '',
            conservation: editingProduct.conservation || '',
            grape_variety: editingProduct.grape_variety || '',
            wine_type: editingProduct.wine_type || '',
            appellation: editingProduct.appellation || '',
            special_mentions: editingProduct.special_mentions || [],
            residual_sugar_gl: editingProduct.residual_sugar_gl || null,
            limited_stock: editingProduct.limited_stock || false,
            highlight_badge: editingProduct.highlight_badge || '',
            producer: editingProduct.producer || '',
            origin: editingProduct.origin || '',
          } : undefined}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={closeProductModal}
          submitLabel={editingProduct ? 'Mettre à jour' : 'Créer'}
        />
      </Modal>

      {/* Slot Modal */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={closeSlotModal}
        title={editingSlot ? 'Modifier le créneau' : 'Ajouter un créneau'}
        size="md"
      >
        <SlotForm
          initialValues={editingSlot ? {
            date: editingSlot.date,
            start_time: editingSlot.start_time,
            end_time: editingSlot.end_time,
            capacity: editingSlot.capacity,
          } : undefined}
          onSubmit={editingSlot ? handleUpdateSlot : handleCreateSlot}
          onCancel={closeSlotModal}
          submitLabel={editingSlot ? 'Mettre à jour' : 'Créer'}
        />
      </Modal>

      {/* Bulk Slot Generation Modal */}
      <Modal
        isOpen={isBulkSlotModalOpen}
        onClose={() => setIsBulkSlotModalOpen(false)}
        title="Générer des créneaux en masse"
        size="lg"
      >
        <BulkSlotGeneratorForm
          onGenerate={handleBulkSlotGeneration}
          onCancel={() => setIsBulkSlotModalOpen(false)}
        />
      </Modal>

      {/* Product Import Modal */}
      {isProductImportModalOpen && (
        <ProductImportModal
          eventId={eventId}
          onClose={() => setIsProductImportModalOpen(false)}
          onImportSuccess={() => {
            fetchEventData()
          }}
        />
      )}
    </div>
  )
}
