'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, Package, User, Mail, Phone, Calendar, MapPin } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useIsMobile } from '@/hooks/useIsMobile'
import MobileAdminLayout from '@/components/admin/mobile/MobileAdminLayout'

interface SearchResult {
  id: string
  code: string
  customer_name: string
  email: string
  phone: string
  status: string
  total_cents: number
  created_at: string
  delivery_type: string
  event: {
    name: string
  }
}

export default function AdminSearchPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setSearching(true)
    setHasSearched(true)

    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

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

  const content = (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Rechercher une commande</h1>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par numéro, nom, email ou téléphone..."
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-[#003f5c] focus:border-transparent text-base"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Recherchez par numéro de commande (ex: CRE-2025-00001), nom du client, email ou téléphone
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {searching && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#003f5c]" />
          </div>
        )}

        {!searching && hasSearched && results.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun résultat</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aucune commande ne correspond à votre recherche
            </p>
          </div>
        )}

        {!searching && results.length > 0 && (
          <div>
            <p className="text-sm text-gray-700 mb-4">
              {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
            </p>

            <div className="space-y-3">
              {results.map((order) => {
                const statusBadge = getStatusBadge(order.status)
                return (
                  <button
                    key={order.id}
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-left"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Order Code & Status */}
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-semibold text-gray-900">
                            #{order.code}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{order.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{order.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{order.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{new Date(order.created_at).toLocaleDateString('fr-BE')}</span>
                          </div>
                        </div>

                        {/* Event */}
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{order.event.name}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(order.total_cents)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {order.delivery_type.toLowerCase().replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {!hasSearched && !searching && (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Commencez à rechercher</h3>
            <p className="mt-1 text-sm text-gray-500">
              Entrez un numéro de commande, nom, email ou téléphone pour rechercher
            </p>
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
