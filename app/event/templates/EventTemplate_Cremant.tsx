'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Calendar, Users, MapPin, Wine, Sparkles, Award, Gift, Heart, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import ClientSlotDisplay from '@/components/event/ClientSlotDisplay'
import ProductModal from '@/components/product/ProductModal'

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
  is_wine?: boolean
  producer?: string
  origin?: string
  grape_variety?: string
  vintage?: string
  wine_type?: string
  appellation?: string
  color?: string
  aromas?: string
  balance?: string
  food_pairings?: string
  conservation?: string
  residual_sugar_gl?: number
  special_mentions?: string[]
  limited_stock?: boolean
  highlight_badge?: string
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

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Carousel state
  const carouselRef = useRef<HTMLDivElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    // Delay clearing the product to allow modal close animation
    setTimeout(() => setSelectedProduct(null), 300)
  }

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.querySelector('.carousel-card')?.clientWidth || 0
      const gap = 40 // gap entre les cards
      const scrollAmount = cardWidth + gap

      const newScrollPosition = direction === 'left'
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount

      carouselRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      })

      // Update current slide indicator
      const newSlide = direction === 'left'
        ? Math.max(0, currentSlide - 1)
        : Math.min(activeProducts.length - 1, currentSlide + 1)
      setCurrentSlide(newSlide)
    }
  }

  const scrollToSlide = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.querySelector('.carousel-card')?.clientWidth || 0
      const gap = 40
      const scrollAmount = (cardWidth + gap) * index

      carouselRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      })
      setCurrentSlide(index)
    }
  }

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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-green-50">
      {/* Hero Section - Elegant & Simple */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-amber-900">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-96 h-96 bg-amber-200 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Subtle Pattern - Champagne Flutes */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='translate(40,15)'%3E%3C!-- Coupe --%3E%3Cpath d='M-8,0 L-6,10 Q-6,15 0,15 Q6,15 6,10 L8,0 Z' fill='none' stroke='white' stroke-width='1.5'/%3E%3C!-- Pied --%3E%3Cline x1='0' y1='15' x2='0' y2='28' stroke='white' stroke-width='1.5'/%3E%3C!-- Base --%3E%3Cpath d='M-5,28 L5,28 M-4,30 L4,30' stroke='white' stroke-width='1.5' stroke-linecap='round'/%3E%3C!-- Bulles --%3E%3Ccircle cx='-2' cy='8' r='0.8' fill='white' opacity='0.6'/%3E%3Ccircle cx='2' cy='6' r='0.8' fill='white' opacity='0.6'/%3E%3Ccircle cx='0' cy='10' r='0.8' fill='white' opacity='0.6'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px',
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            {/* Premium Badge - Festive */}
            <div className="flex justify-center mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 shadow-2xl hover:scale-105 transition-transform duration-300">
                <Gift className="w-5 h-5 text-amber-300" />
                <span className="text-white font-semibold tracking-wide">SÉLECTION FÊTES DE FIN D'ANNÉE</span>
                <Gift className="w-5 h-5 text-amber-300" />
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight tracking-tight animate-slide-up">
              Bulles & Vins pour les Fêtes
            </h1>

            {/* Simple Description */}
            <p className="text-xl md:text-2xl text-green-50 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up animation-delay-100">
              Crémant d'Alsace, Champagne et Vin blanc pour sublimer vos tables de fêtes
            </p>

            {/* Meta Info - Simplified */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 text-green-100 animate-slide-up animation-delay-200">
              {hero_config.show_deadline && (
                <div className="flex items-center gap-2 hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5 text-amber-300" />
                  <span>Jusqu'au <strong className="font-semibold text-white">{formatDate(event.end_date)}</strong></span>
                </div>
              )}

              {config.pickup_address && (
                <div className="flex items-center gap-2 hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5 text-amber-300" />
                  <span className="font-medium">{config.pickup_address}</span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="animate-slide-up animation-delay-300">
              <button
                onClick={() => {
                  const productsSection = document.getElementById('products-section')
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }}
                className="group px-10 md:px-12 py-5 md:py-6 rounded-full text-lg md:text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-2xl hover:shadow-amber-500/50 hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-3">
                  <Wine className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  Découvrir la sélection
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section - Priority */}
      {activeProducts.length > 0 && (
        <section id="products-section" className="py-20 md:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-amber-700 text-white rounded-full px-5 py-2 mb-4 font-semibold text-sm animate-fade-in">
                <Wine className="w-4 h-4" />
                NOTRE SÉLECTION
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-slide-up">
                Un assortiment pour tous les goûts
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-slide-up animation-delay-100">
                Du Crémant d'Alsace au Champagne, en passant par le vin blanc :
                trois options de qualité pour vos repas de fête
              </p>
            </div>

            {/* Carousel Container */}
            <div className="relative overflow-hidden">
              {/* Navigation Buttons - Desktop only */}
              {activeProducts.length > 1 && (
                <>
                  <button
                    onClick={() => scrollCarousel('left')}
                    disabled={currentSlide === 0}
                    className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white shadow-2xl rounded-full p-4 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
                    aria-label="Produit précédent"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={() => scrollCarousel('right')}
                    disabled={currentSlide === activeProducts.length - 1}
                    className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white shadow-2xl rounded-full p-4 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
                    aria-label="Produit suivant"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                </>
              )}

              {/* Fade overlays on sides - Desktop only */}
              <div className="hidden md:block absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none"></div>
              <div className="hidden md:block absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-white via-white/90 to-transparent z-10 pointer-events-none"></div>

              {/* Carousel - Desktop version (centré avec éléments visibles sur les côtés) */}
              <div
                ref={carouselRef}
                className="hidden md:flex overflow-x-auto gap-10 pb-4 snap-x snap-mandatory scroll-smooth"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                  paddingLeft: 'max(1rem, calc((100vw - 500px) / 2))',
                  paddingRight: 'max(1rem, calc((100vw - 500px) / 2))',
                }}
              >
              {activeProducts.map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="carousel-card group relative bg-gradient-to-b from-white to-stone-50/50 overflow-hidden border border-stone-200/50 hover:border-amber-600/30 transition-all duration-500 cursor-pointer hover:shadow-xl flex-shrink-0 w-[420px] md:w-[450px] lg:w-[500px] snap-center"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.15}s backwards`,
                  }}
                >
                  {/* Decorative top line */}
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent"></div>

                  {/* Image Container */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-stone-50 to-amber-50/10">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    )}

                    {/* Corner badges - elegant ribbon style */}
                    {product.highlight_badge && (
                      <div className="absolute top-0 left-0">
                        <div className="relative bg-gradient-to-br from-amber-600 to-amber-700 text-white px-4 py-1.5 shadow-lg">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            <span className="text-[10px] font-semibold tracking-widest uppercase">{product.highlight_badge}</span>
                          </div>
                          <div className="absolute -bottom-1.5 left-0 w-0 h-0 border-t-[6px] border-t-amber-900 border-r-[6px] border-r-transparent"></div>
                        </div>
                      </div>
                    )}

                    {product.limited_stock && (
                      <div className="absolute top-0 right-0">
                        <div className="relative bg-gradient-to-br from-red-600 to-red-700 text-white px-4 py-1.5 shadow-lg">
                          <span className="text-[10px] font-semibold tracking-widest uppercase">Stock limité</span>
                          <div className="absolute -bottom-1.5 right-0 w-0 h-0 border-t-[6px] border-t-red-900 border-l-[6px] border-l-transparent"></div>
                        </div>
                      </div>
                    )}

                    {/* Vintage badge - elegant bottom placement */}
                    {product.vintage && (
                      <div className="absolute bottom-4 left-4 bg-stone-900/95 backdrop-blur-sm text-white px-4 py-2 border-l-2 border-amber-600">
                        <div className="text-xs tracking-widest uppercase text-stone-400" style={{ fontSize: '9px' }}>Millésime</div>
                        <div className="text-2xl font-light tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>{product.vintage}</div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-5">
                    {/* Title section */}
                    <div className="min-h-[80px]">
                      <h3 className="text-2xl font-light text-stone-900 mb-2 group-hover:text-amber-800 transition-colors leading-tight tracking-tight line-clamp-2" style={{ fontFamily: 'Georgia, serif' }}>
                        {product.name}
                      </h3>

                      {/* Producer & Origin - elegant format */}
                      {(product.producer || product.origin) && (
                        <div className="text-xs text-stone-600 space-y-0.5">
                          {product.producer && (
                            <div className="flex items-center gap-2">
                              <Wine className="w-3 h-3 text-amber-600" />
                              <span className="font-medium">{product.producer}</span>
                            </div>
                          )}
                          {product.origin && (
                            <div className="flex items-center gap-2 text-stone-500">
                              <MapPin className="w-3 h-3" />
                              <span>{product.origin}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Appellation - featured if present */}
                    {product.appellation && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white">
                        <Award className="w-3 h-3" />
                        <span className="text-xs tracking-wide font-medium">{product.appellation}</span>
                      </div>
                    )}

                    {/* Key specs - minimal badges */}
                    {product.is_wine && (product.grape_variety || product.wine_type) && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {product.grape_variety && (
                          <span className="px-2.5 py-1 border border-stone-300 text-stone-700 font-medium tracking-wide">
                            {product.grape_variety}
                          </span>
                        )}
                        {product.wine_type && (
                          <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-medium tracking-wide">
                            {product.wine_type}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price section - elegant divider */}
                    <div className="pt-5 border-t border-stone-200">
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <div className="text-[9px] uppercase tracking-widest text-stone-400 mb-1.5 font-light">Prix</div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-4xl font-light text-stone-900 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                              {formatPrice(product.price_cents)}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-500 mt-0.5 tracking-wide">
                            {product.is_wine ? 'par bouteille' : "l'unité"}
                          </div>
                        </div>

                        {product.stock !== null && product.limited_stock && (
                          <div className="text-right">
                            <div className="text-[9px] uppercase tracking-widest text-stone-400 mb-1">Stock</div>
                            <div className="text-2xl font-light text-red-600" style={{ fontFamily: 'Georgia, serif' }}>{product.stock}</div>
                          </div>
                        )}
                      </div>

                      {/* Elegant CTA */}
                      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-amber-700 font-semibold group-hover:text-amber-800 transition-colors">
                        <span>Détails</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Decorative bottom accent */}
                  <div className="h-1 bg-gradient-to-r from-transparent via-amber-600/20 to-transparent group-hover:via-amber-600/40 transition-all duration-500"></div>
                </div>
              ))}
              </div>

              {/* Mobile Carousel - 3D Perspective */}
              <div className="md:hidden" style={{ perspective: '1000px', perspectiveOrigin: 'center' }}>
                <div
                  ref={carouselRef}
                  className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scroll-smooth px-8"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  {activeProducts.map((product, index) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="carousel-card group relative bg-gradient-to-b from-white to-stone-50/50 overflow-hidden border border-stone-200/50 active:border-amber-600/30 transition-all duration-300 cursor-pointer shadow-lg active:shadow-xl flex-shrink-0 w-[80vw] snap-center"
                      style={{
                        transformStyle: 'preserve-3d',
                        animation: `fadeInUp 0.6s ease-out ${index * 0.15}s backwards`,
                      }}
                    >
                      {/* Decorative top line */}
                      <div className="h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent"></div>

                      {/* Compact Image Container */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-stone-50 to-amber-50/10">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-contain p-3"
                          />
                        )}

                        {/* Badges */}
                        {product.highlight_badge && (
                          <div className="absolute top-0 left-0">
                            <div className="relative bg-gradient-to-br from-amber-600 to-amber-700 text-white px-3 py-1 shadow-lg">
                              <div className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span className="text-[9px] font-semibold tracking-widest uppercase">{product.highlight_badge}</span>
                              </div>
                              <div className="absolute -bottom-1 left-0 w-0 h-0 border-t-[4px] border-t-amber-900 border-r-[4px] border-r-transparent"></div>
                            </div>
                          </div>
                        )}

                        {product.vintage && (
                          <div className="absolute bottom-2 left-2 bg-stone-900/95 backdrop-blur-sm text-white px-3 py-1.5 border-l-2 border-amber-600">
                            <div className="text-[8px] tracking-widest uppercase text-stone-400">Millésime</div>
                            <div className="text-lg font-light tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>{product.vintage}</div>
                          </div>
                        )}
                      </div>

                      {/* Compact Content */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="text-lg font-light text-stone-900 mb-1 line-clamp-2" style={{ fontFamily: 'Georgia, serif' }}>
                            {product.name}
                          </h3>
                          {product.producer && (
                            <div className="flex items-center gap-1.5 text-xs text-stone-600">
                              <Wine className="w-3 h-3 text-amber-600" />
                              <span className="font-medium">{product.producer}</span>
                            </div>
                          )}
                        </div>

                        {/* Prix compact */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-light text-amber-700" style={{ fontFamily: 'Georgia, serif' }}>
                            {(product.price_cents / 100).toFixed(2)}€
                          </span>
                        </div>

                        {/* Tap to see more */}
                        <div className="text-xs text-center text-amber-600 font-medium pt-2 border-t border-stone-200/50">
                          Toucher pour voir plus
                        </div>
                      </div>

                      {/* Decorative bottom accent */}
                      <div className="h-1 bg-gradient-to-r from-transparent via-amber-600/20 to-transparent"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel indicators */}
              {activeProducts.length > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {activeProducts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToSlide(index)}
                      className={`transition-all duration-300 rounded-full ${
                        currentSlide === index
                          ? 'w-8 h-2 bg-amber-600'
                          : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Aller au produit ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* CTA Button - Commander */}
            <div className="mt-16 text-center">
              <Link href={`/event/${event.slug}/commander`}>
                <button className="group px-12 py-5 rounded-full text-lg font-bold bg-gradient-to-r from-emerald-600 to-amber-600 text-white shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300">
                  <span className="flex items-center gap-3">
                    <Wine className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    Je passe commande
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </Link>
              <p className="mt-4 text-sm text-gray-600">
                Livraison gratuite dès 6 bouteilles • Paiement sécurisé
              </p>
            </div>
          </div>
        </section>
      )}

      {/* About Domaine Lissner - Coup de cœur */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-amber-700 text-white rounded-full px-5 py-2 mb-4 font-semibold text-sm animate-fade-in">
              <Heart className="w-4 h-4" />
              NOTRE COUP DE CŒUR
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-slide-up">
              Le savoir-faire du Domaine Lissner
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-slide-up animation-delay-100">
              Nous avons eu la chance de rencontrer la famille Lissner, vignerons passionnés en Alsace.
              Découvrez leur méthode artisanale et leur amour du terroir dans cette vidéo exclusive.
            </p>
          </div>

          {/* Video Section - Placeholder for future video */}
          <div className="max-w-4xl mx-auto mb-12 animate-scale-in">
            <div className="relative aspect-video bg-gradient-to-br from-emerald-900 to-amber-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-200 hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <PlayCircle className="w-24 h-24 mb-4 text-amber-300 opacity-80 hover:opacity-100 transition-opacity" />
                <p className="text-2xl font-bold mb-2">Vidéo à venir</p>
                <p className="text-amber-100 text-sm">Rencontre avec la famille Lissner et découverte de leur savoir-faire</p>
              </div>
              {/* When video is ready, replace with:
              <video controls className="w-full h-full object-cover">
                <source src="/path-to-video.mp4" type="video/mp4" />
              </video>
              */}
            </div>
          </div>

          {/* Key Points - Domaine Lissner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                <Wine className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Méthode traditionnelle</h3>
              <p className="text-gray-600 leading-relaxed">
                Le Domaine Lissner élabore ses Crémants selon la méthode champenoise traditionnelle
              </p>
            </div>
            <div className="text-center p-6 group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Édition limitée</h3>
              <p className="text-gray-600 leading-relaxed">
                Seulement 36 bouteilles de Crémant Blanc de Noir disponibles - une exclusivité rare
              </p>
            </div>
            <div className="text-center p-6 group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Passion familiale</h3>
              <p className="text-gray-600 leading-relaxed">
                Une famille de vignerons qui transmet son amour du vin de génération en génération
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Slots */}
      {slots.length > 0 && (
        <ClientSlotDisplay
          slots={slots}
          eventType={event.event_type}
          sectionColor="#065f46"
        />
      )}

      {/* Final CTA Section - Holiday themed */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-amber-900">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-300 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Gift className="w-16 h-16 text-amber-300 mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in">
            Prêts pour les fêtes ?
          </h2>
          <p className="text-xl md:text-2xl text-green-100 mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up animation-delay-100">
            Commandez dès maintenant votre sélection de vins et mousseux.
            Chaque achat soutient nos activités scoutes.
          </p>

          <div className="animate-slide-up animation-delay-200">
            <Link href={`/event/${event.slug}/commander`}>
              <button className="group px-12 py-6 rounded-full text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-2xl hover:shadow-amber-500/50 hover:scale-110 transition-all duration-300">
                <span className="flex items-center gap-3">
                  <Wine className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                  Commander maintenant
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </Link>
          </div>

          <p className="mt-8 text-green-200 text-sm animate-fade-in animation-delay-300">
            Commandes jusqu'au {formatDate(event.end_date)}
          </p>
        </div>
      </section>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          product={{
            name: selectedProduct.name,
            producer: selectedProduct.producer,
            origin: selectedProduct.origin,
            grape_variety: selectedProduct.grape_variety,
            vintage: selectedProduct.vintage,
            wine_type: selectedProduct.wine_type,
            appellation: selectedProduct.appellation,
            color: selectedProduct.color,
            aromas: selectedProduct.aromas,
            balance: selectedProduct.balance,
            food_pairing: selectedProduct.food_pairings,
            conservation: selectedProduct.conservation,
            residual_sugar: selectedProduct.residual_sugar_gl ? `${selectedProduct.residual_sugar_gl} g/L` : undefined,
            special_mentions: selectedProduct.special_mentions?.join(' • '),
            price: selectedProduct.price_cents,
            image_url: selectedProduct.image_url || undefined,
            stock_qty: selectedProduct.stock || undefined,
            is_limited_edition: selectedProduct.limited_stock,
            product_type: selectedProduct.product_type,
          }}
        />
      )}
    </div>
  )
}
