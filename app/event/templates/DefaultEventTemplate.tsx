'use client'

import Link from 'next/link'
import { Calendar, Users, MapPin, Package, Clock } from 'lucide-react'
import Button from '@/components/ui/Button'

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
  start_date: string
  end_date: string
  section: Section
  hero_image_url?: string
  hero_title: string
  hero_subtitle?: string
  hero_show_stats: boolean
  hero_cta_text: string
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
}

interface DefaultEventTemplateProps {
  event: Event
  products: Product[]
  slots: Slot[]
}

export default function DefaultEventTemplate({
  event,
  products,
  slots,
}: DefaultEventTemplateProps) {
  const section = event.section
  const hero_config = {
    image_url: event.hero_image_url,
    title: event.hero_title,
    subtitle: event.hero_subtitle,
    show_stats: event.hero_show_stats,
    cta_text: event.hero_cta_text,
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('fr-BE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  const formatPrice = (cents: number): string => {
    return `${(cents / 100).toFixed(2)} €`
  }

  const activeProducts = products.filter((p) => p.is_active).sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative py-24 lg:py-32 overflow-hidden"
        style={{
          background: hero_config.image_url
            ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${hero_config.image_url}) center/cover`
            : `linear-gradient(135deg, ${section.color} 0%, ${section.color}dd 100%)`,
        }}
      >
        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            {/* Section Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: section.color }} />
              <span className="text-white font-medium text-sm">{section.name}</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {hero_config.title}
            </h1>

            {/* Subtitle */}
            {hero_config.subtitle && (
              <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed max-w-2xl">
                {hero_config.subtitle}
              </p>
            )}

            {/* Stats */}
            {hero_config.show_stats && event.stats && event.stats.totalOrders > 0 && (
              <div className="flex items-center gap-2 text-white text-base mb-8">
                <Users className="w-5 h-5" style={{ color: 'white' }} />
                <span>
                  <strong className="font-semibold">{event.stats.totalOrders}</strong> commande
                  {event.stats.totalOrders > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* CTA Button */}
            <Link href={`/event/${event.slug}/commander`}>
              <Button size="lg" className="bg-white hover:bg-gray-100" style={{ color: section.color }}>
                {hero_config.cta_text}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Products Section */}
      {activeProducts.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Produits</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Découvrez notre sélection de produits
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  {product.image_url && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-4 h-4" style={{ color: section.color }} />
                      <span className="text-xs font-medium uppercase tracking-wider" style={{ color: section.color }}>
                        {product.product_type}
                      </span>
                    </div>

                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>

                    <div className="flex items-center justify-between">
                      <p className="text-3xl font-bold" style={{ color: section.color }}>
                        {formatPrice(product.price_cents)}
                      </p>

                      {product.stock !== null && (
                        <span className="text-sm text-gray-500">Stock : {product.stock}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: `${section.color}15` }}>
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Prêt à commander ?</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Commandez dès maintenant et soutenez notre initiative
          </p>

          <Link href={`/event/${event.slug}/commander`}>
            <Button size="lg" style={{ backgroundColor: section.color }} className="hover:opacity-90">
              {hero_config.cta_text}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
