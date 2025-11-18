import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Package, Users, Wine, Sparkles, Award } from 'lucide-react'
import Button from '@/components/ui/Button'
import type { Event, EventResponse } from '@/types/event'
import ValuePropositions from '@/components/event/ValuePropositions'
import AboutSection from '@/components/event/AboutSection'
import MediaSection from '@/components/event/MediaSection'
import FAQSection from '@/components/event/FAQSection'
import SocialLinks from '@/components/event/SocialLinks'
import { createServerClient } from '@/lib/supabase/server'
import { customTemplates } from '../templates'
import DefaultEventTemplate from '../templates/DefaultEventTemplate'
import ClientSlotDisplay from '@/components/event/ClientSlotDisplay'

async function getEvent(slug: string): Promise<Event | null> {
  try {
    const supabase = createServerClient() as any

    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        section:sections(
          id,
          name,
          slug,
          color
        ),
        products(
          id,
          name,
          description,
          price_cents,
          product_type,
          stock,
          is_active,
          sort_order,
          image_url,
          allergens,
          is_vegetarian,
          is_vegan,
          is_wine,
          vintage,
          wine_color:color,
          aromas,
          balance,
          food_pairings,
          conservation,
          grape_variety,
          wine_type,
          appellation,
          special_mentions,
          residual_sugar_gl,
          limited_stock,
          highlight_badge,
          producer,
          origin
        ),
        slots(
          id,
          date,
          start_time,
          end_time,
          capacity
        )
      `)
      .eq('slug', slug)
      .eq('status', 'ACTIVE')
      .single()

    if (error || !event) {
      console.error('Erreur fetch événement:', {
        error,
        errorString: JSON.stringify(error),
        errorMessage: error?.message,
        errorDetails: error?.details,
        errorHint: error?.hint,
        errorCode: error?.code,
        eventData: event,
      })
      return null
    }

    // Transformer l'alias wine_color en color pour les produits
    if (event.products) {
      event.products = event.products.map((product: any) => {
        if (product.wine_color !== undefined) {
          product.color = product.wine_color
          delete product.wine_color
        }
        return product
      })
    }

    // Calculer les stats (nombre de commandes)
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id)
      .in('status', ['PENDING', 'PAID', 'PREPARED', 'DELIVERED'])

    // Ajouter les stats de réservation pour chaque créneau
    const slotsWithStats = await Promise.all(
      (event.slots || []).map(async (slot: any) => {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('slot_id', slot.id)
          .in('status', ['PENDING', 'PAID', 'PREPARED'])

        const remainingCapacity = slot.capacity - (count || 0)

        return {
          ...slot,
          remainingCapacity,
          isFull: remainingCapacity <= 0,
        }
      })
    )

    return {
      ...event,
      slots: slotsWithStats,
      stats: {
        totalOrders: ordersCount || 0,
      },
    }
  } catch (error) {
    console.error('Erreur fetch événement:', error)
    return null
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-BE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2) + ' €'
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    notFound()
  }

  // Check if a custom template exists for this event slug
  const CustomTemplate = customTemplates[slug]
  if (CustomTemplate) {
    return (
      <CustomTemplate
        event={event}
        products={event.products || []}
        slots={event.slots || []}
      />
    )
  }

  const { hero_config, section, products, slots, config } = event
  const activeProducts = products.filter((p) => p.is_active)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Dynamic Gradient Background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, ${section.color} 0%, ${section.color}40 50%, transparent 100%)`,
          }}
        />

        {hero_config.banner_url && (
          <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
            <img
              src={hero_config.banner_url}
              alt={hero_config.title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, ${section.color}20 0%, ${section.color}60 100%)`,
              }}
            />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          {/* Section Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-5 transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: section.color + '15',
              color: section.color,
              border: `1.5px solid ${section.color}30`,
            }}
          >
            <Users className="w-4 h-4" />
            {section.name}
          </div>

          {/* Title - Apple-style large and bold */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-5 leading-tight tracking-tight">
            {hero_config.title}
          </h1>

          {hero_config.subtitle && (
            <p className="text-xl sm:text-2xl md:text-3xl font-medium mb-6 leading-snug max-w-4xl"
              style={{ color: section.color }}
            >
              {hero_config.subtitle}
            </p>
          )}

          {hero_config.description && (
            <p className="text-base md:text-lg text-gray-600 mb-8 max-w-3xl leading-relaxed">
              {hero_config.description}
            </p>
          )}

          {/* Features Grid - Modern cards */}
          {hero_config.features && hero_config.features.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
              {hero_config.features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white/80 backdrop-blur-sm p-4 md:p-5 rounded-xl md:rounded-2xl text-center transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-default"
                  style={{
                    boxShadow: `0 10px 40px ${section.color}15`,
                    border: `1px solid ${section.color}10`,
                  }}
                >
                  <Package
                    className="w-6 h-6 md:w-7 md:h-7 mx-auto mb-2 md:mb-3 transition-transform duration-300 group-hover:scale-110"
                    style={{ color: section.color }}
                  />
                  <p className="text-xs md:text-sm font-semibold text-gray-900">{feature}</p>
                </div>
              ))}
            </div>
          )}

          {/* Meta Info & CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 mb-8">
            {hero_config.show_deadline && (
              <div className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                <Calendar className="w-4 h-4 md:w-5 md:h-5" style={{ color: section.color }} />
                <span>
                  Jusqu'au <strong className="font-semibold">{formatDate(event.end_date)}</strong>
                </span>
              </div>
            )}

            {hero_config.show_stats && event.stats.totalOrders > 0 && (
              <div className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                <Users className="w-4 h-4 md:w-5 md:h-5" style={{ color: section.color }} />
                <span>
                  <strong className="font-semibold">{event.stats.totalOrders}</strong> commande
                  {event.stats.totalOrders > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {config.pickup_address && (
              <div className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                <MapPin className="w-4 h-4 md:w-5 md:h-5" style={{ color: section.color }} />
                <span className="font-medium">{config.pickup_address}</span>
              </div>
            )}
          </div>

          {/* CTA Button - Apple-style prominent */}
          <div>
            <Link href={`/event/${event.slug}/commander`}>
              <button
                className="group px-8 md:px-10 py-4 md:py-5 rounded-full text-base md:text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                  backgroundColor: section.color,
                  boxShadow: `0 15px 50px ${section.color}40`,
                }}
              >
                <span className="flex items-center gap-2">
                  {hero_config.cta_text || 'Commander maintenant'}
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Propositions (optionnel) */}
      {hero_config.value_propositions && (
        <ValuePropositions
          items={hero_config.value_propositions}
          sectionColor={section.color}
        />
      )}

      {/* About Section (optionnel) */}
      {hero_config.about_section && (
        <AboutSection
          data={hero_config.about_section}
          sectionColor={section.color}
        />
      )}

      {/* Media Section (optionnel) */}
      {hero_config.media && (
        <MediaSection data={hero_config.media} sectionColor={section.color} />
      )}

      {/* Products Section */}
      {activeProducts.length > 0 && (
        <section className="relative py-16 md:py-24 overflow-hidden">
          {/* Background gradient */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background: `linear-gradient(135deg, transparent 0%, ${section.color}30 50%, transparent 100%)`,
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-12 md:mb-14">
              <div
                className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
                style={{
                  backgroundColor: section.color + '15',
                  color: section.color,
                }}
              >
                {event.event_type === 'PRODUCT_SALE' && 'Nos Produits'}
                {event.event_type === 'MEAL' && 'Nos Menus'}
                {event.event_type === 'RAFFLE' && 'Tickets'}
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                {event.event_type === 'PRODUCT_SALE' && 'Découvrez notre sélection'}
                {event.event_type === 'MEAL' && 'Menus disponibles'}
                {event.event_type === 'RAFFLE' && 'Tickets disponibles'}
              </h2>
            </div>

            {/* Product Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {activeProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105 cursor-default"
                  style={{
                    boxShadow: `0 10px 40px ${section.color}15`,
                    border: `1px solid ${section.color}10`,
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards`,
                  }}
                >
                  {/* Card Header with gradient */}
                  <div
                    className="h-1.5 md:h-2"
                    style={{
                      background: `linear-gradient(90deg, ${section.color} 0%, ${section.color}80 100%)`,
                    }}
                  />

                  <div className="p-6 md:p-8">
                    {/* Badges spéciaux */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {product.highlight_badge && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Sparkles className="w-3 h-3" />
                          {product.highlight_badge}
                        </span>
                      )}
                      {product.limited_stock && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                          Stock limité
                        </span>
                      )}
                    </div>

                    {/* Product Name */}
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-opacity-80 transition-all">
                      {product.name}
                    </h3>

                    {/* Wine-specific info */}
                    {product.is_wine && (
                      <div className="space-y-3 mb-5">
                        {/* Producer & Origin */}
                        {(product.producer || product.origin) && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Award className="w-4 h-4" style={{ color: section.color }} />
                            <span>
                              {product.producer && <strong>{product.producer}</strong>}
                              {product.producer && product.origin && ' - '}
                              {product.origin && <span className="italic">{product.origin}</span>}
                            </span>
                          </div>
                        )}

                        {/* Grape variety & Vintage */}
                        {(product.grape_variety || product.vintage) && (
                          <div className="flex flex-wrap gap-2 text-xs">
                            {product.grape_variety && (
                              <span className="px-2 py-1 rounded bg-purple-50 text-purple-700 font-medium border border-purple-200">
                                {product.grape_variety}
                              </span>
                            )}
                            {product.vintage && (
                              <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-medium border border-gray-300">
                                Millésime {product.vintage}
                              </span>
                            )}
                            {product.wine_type && (
                              <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-medium border border-blue-200">
                                {product.wine_type}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Appellation */}
                        {product.appellation && (
                          <p className="text-sm font-semibold text-purple-900 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                            {product.appellation}
                          </p>
                        )}

                        {/* Color */}
                        {product.color && (
                          <div className="text-sm">
                            <span className="text-gray-600">Couleur : </span>
                            <span className="font-medium text-gray-900">{product.color}</span>
                          </div>
                        )}

                        {/* Aromas */}
                        {product.aromas && (
                          <div className="text-sm">
                            <span className="text-gray-600">Arômes : </span>
                            <span className="font-medium text-gray-900">{product.aromas}</span>
                          </div>
                        )}

                        {/* Balance */}
                        {product.balance && (
                          <div className="text-sm">
                            <span className="text-gray-600">Équilibre : </span>
                            <span className="font-medium text-gray-900">{product.balance}</span>
                          </div>
                        )}

                        {/* Food pairings */}
                        {product.food_pairings && (
                          <div className="text-sm">
                            <span className="text-gray-600">Accords : </span>
                            <span className="font-medium text-gray-900">{product.food_pairings}</span>
                          </div>
                        )}

                        {/* Conservation */}
                        {product.conservation && (
                          <div className="text-sm">
                            <span className="text-gray-600">Conservation : </span>
                            <span className="font-medium text-gray-900">{product.conservation}</span>
                          </div>
                        )}

                        {/* Special mentions */}
                        {product.special_mentions && product.special_mentions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {product.special_mentions.map((mention, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 border border-green-300 font-medium"
                              >
                                {mention}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description (for non-wine products) */}
                    {!product.is_wine && product.description && (
                      <p className="text-gray-600 text-sm md:text-base mb-5 md:mb-6 leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    {/* Price and Stock */}
                    <div className="flex items-end justify-between mb-5 md:mb-6">
                      <div>
                        <span
                          className="text-3xl md:text-4xl font-bold"
                          style={{ color: section.color }}
                        >
                          {formatPrice(product.price_cents)}
                        </span>
                        <span className="text-gray-500 text-xs md:text-sm ml-2">
                          {product.is_wine ? '/ bouteille' : '/ unité'}
                        </span>
                      </div>

                      {product.stock !== null && (
                        <span className="text-xs md:text-sm text-gray-500 font-medium">
                          Stock: {product.stock}
                        </span>
                      )}
                    </div>

                    {/* Discount Badge */}
                    {config.discount_10for9 && product.product_type === 'ITEM' && (
                      <div
                        className="px-3 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl text-center font-semibold text-xs md:text-sm transition-all duration-300 group-hover:scale-105"
                        style={{
                          backgroundColor: section.color + '15',
                          color: section.color,
                          border: `1.5px solid ${section.color}30`,
                        }}
                      >
                        10 pour le prix de 9
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
          sectionColor={section.color}
        />
      )}

      {/* FAQ Section (optionnel) */}
      {hero_config.faq && (
        <FAQSection items={hero_config.faq} sectionColor={section.color} />
      )}

      {/* Social Links (optionnel) */}
      {hero_config.social_links && (
        <SocialLinks data={hero_config.social_links} sectionColor={section.color} />
      )}
    </div>
  )
}
