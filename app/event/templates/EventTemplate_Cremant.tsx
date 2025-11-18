'use client'

import Link from 'next/link'
import { Calendar, Users, MapPin, Wine, Sparkles, Check, Package } from 'lucide-react'
import Button from '@/components/ui/Button'
import ClientSlotDisplay from '@/components/event/ClientSlotDisplay'

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
  description: string
  event_type: string
  start_date: string
  end_date: string
  section: Section
  hero_config: any
  config: any
  stats?: {
    totalOrders: number
  }
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
  image_url: string | null
}

interface Slot {
  id: string
  date: string
  start_time: string
  end_time: string
  capacity: number
  remainingCapacity?: number
  isFull?: boolean
}

interface EventTemplateCremantProps {
  event: Event
  products: Product[]
  slots: Slot[]
}

export default function EventTemplateCremant({
  event,
  products,
  slots,
}: EventTemplateCremantProps) {
  const section = event.section
  const hero_config = event.hero_config
  const config = event.config

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('fr-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  const formatPrice = (cents: number): string => {
    return `${(cents / 100).toFixed(2)} €`
  }

  const activeProducts = products.filter((p) => p.is_active).sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
      {/* Hero Section - Wine Themed */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-200 rounded-full blur-3xl" />
        </div>

        {/* Wine Glass Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10 L40 35 Q40 50 50 55 Q60 50 60 35 L50 10 M50 55 L50 80 M40 80 L60 80' stroke='white' fill='none' stroke-width='2'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px',
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            {/* Premium Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 shadow-2xl">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span className="text-white font-semibold tracking-wide">VENTE EXCLUSIVE</span>
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight tracking-tight">
              {hero_config.title}
            </h1>

            {hero_config.subtitle && (
              <p className="text-2xl sm:text-3xl md:text-4xl font-medium text-amber-100 mb-8 leading-snug max-w-4xl mx-auto">
                {hero_config.subtitle}
              </p>
            )}

            {hero_config.description && (
              <p className="text-lg md:text-xl text-amber-50 mb-10 max-w-3xl mx-auto leading-relaxed">
                {hero_config.description}
              </p>
            )}

            {/* Key Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
                <Wine className="w-8 h-8 text-amber-200 mx-auto mb-3" />
                <p className="text-white font-semibold">Qualité Premium</p>
                <p className="text-amber-100 text-sm mt-1">Crémant d'Alsace AOC</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
                <Package className="w-8 h-8 text-amber-200 mx-auto mb-3" />
                <p className="text-white font-semibold">Livraison locale</p>
                <p className="text-amber-100 text-sm mt-1">Retrait à Écaussinnes</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
                <Sparkles className="w-8 h-8 text-amber-200 mx-auto mb-3" />
                <p className="text-white font-semibold">Prix avantageux</p>
                <p className="text-amber-100 text-sm mt-1">10 pour le prix de 9</p>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 text-amber-50">
              {hero_config.show_deadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Commandez jusqu'au <strong className="font-semibold text-white">{formatDate(event.end_date)}</strong></span>
                </div>
              )}

              {hero_config.show_stats && event.stats && event.stats.totalOrders > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span><strong className="font-semibold text-white">{event.stats.totalOrders}</strong> commande{event.stats.totalOrders > 1 ? 's' : ''}</span>
                </div>
              )}

              {config.pickup_address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">{config.pickup_address}</span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <Link href={`/event/${event.slug}/commander`}>
              <button className="group px-10 md:px-12 py-5 md:py-6 rounded-full text-lg md:text-xl font-bold bg-white text-amber-900 shadow-2xl hover:shadow-amber-500/50 hover:scale-105 transition-all duration-300">
                <span className="flex items-center gap-3">
                  <Wine className="w-6 h-6" />
                  {hero_config.cta_text || 'Commander maintenant'}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 rounded-full px-5 py-2 mb-4 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              POURQUOI CHOISIR NOTRE CRÉMANT
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              L'excellence du Crémant d'Alsace
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un vin effervescent de qualité pour vos moments de fête, au meilleur prix
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Check className="w-6 h-6" />,
                title: 'AOC Crémant d\'Alsace',
                description: 'Appellation d\'Origine Contrôlée garantissant la qualité et le savoir-faire',
              },
              {
                icon: <Check className="w-6 h-6" />,
                title: 'Méthode traditionnelle',
                description: 'Élaboré selon la méthode champenoise pour des bulles fines et élégantes',
              },
              {
                icon: <Check className="w-6 h-6" />,
                title: 'Prix avantageux',
                description: 'Profitez de notre offre spéciale : 10 bouteilles pour le prix de 9',
              },
              {
                icon: <Check className="w-6 h-6" />,
                title: 'Soutien local',
                description: 'Chaque achat soutient les activités des Pionniers d\'Écaussinnes',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-amber-100"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform shadow-lg">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-700 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      {activeProducts.length > 0 && (
        <section className="py-20 md:py-28 bg-gradient-to-b from-amber-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-amber-900 text-amber-50 rounded-full px-5 py-2 mb-4 font-semibold text-sm">
                <Wine className="w-4 h-4" />
                NOS PRODUITS
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Découvrez notre sélection
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-amber-100"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.15}s backwards`,
                  }}
                >
                  {/* Premium Header */}
                  <div className="h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

                  {product.image_url && (
                    <div className="aspect-square overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <div className="p-8">
                    {/* Product Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <Wine className="w-3 h-3" />
                        {product.product_type}
                      </div>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-amber-900 transition-colors">
                      {product.name}
                    </h3>

                    {/* Description */}
                    {product.description && (
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-end justify-between mb-6">
                      <div>
                        <span className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                          {formatPrice(product.price_cents)}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">/ bouteille</span>
                      </div>
                      {product.stock !== null && (
                        <span className="text-sm text-gray-500 font-medium">
                          Stock: {product.stock}
                        </span>
                      )}
                    </div>

                    {/* Discount Badge */}
                    {config.discount_10for9 && product.product_type === 'ITEM' && (
                      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl p-4 text-center font-bold text-sm shadow-lg">
                        <Sparkles className="w-4 h-4 inline mr-2" />
                        10 pour le prix de 9
                        <Sparkles className="w-4 h-4 inline ml-2" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Available Slots */}
      {slots.length > 0 && (
        <ClientSlotDisplay
          slots={slots}
          eventType={event.event_type}
          sectionColor="#b45309"
        />
      )}

      {/* Final CTA Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-amber-900 via-orange-900 to-amber-800">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-200 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-16 h-16 text-amber-200 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Prêt à commander votre Crémant ?
          </h2>
          <p className="text-xl md:text-2xl text-amber-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Ne manquez pas cette occasion de profiter d'un Crémant d'Alsace de qualité à un prix exceptionnel.
            Chaque commande soutient les activités des Pionniers !
          </p>

          <Link href={`/event/${event.slug}/commander`}>
            <button className="group px-12 py-6 rounded-full text-xl font-bold bg-white text-amber-900 shadow-2xl hover:shadow-amber-500/50 hover:scale-110 transition-all duration-300">
              <span className="flex items-center gap-3">
                <Wine className="w-7 h-7" />
                Commander maintenant
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </Link>

          <p className="mt-8 text-amber-200 text-sm">
            Commandes jusqu'au {formatDate(event.end_date)}
          </p>
        </div>
      </section>
    </div>
  )
}
