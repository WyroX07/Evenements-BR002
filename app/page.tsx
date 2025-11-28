'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, ShoppingBag, Sparkles } from 'lucide-react'
import AdminLoginModal from '@/components/layout/AdminLoginModal'

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
  event_type: 'PRODUCT_SALE' | 'MEAL' | 'RAFFLE'
  start_date: string
  end_date: string
  section: Section
  stats: {
    ordersCount: number
  }
}

interface EventsResponse {
  events: Event[]
}

function getEventTypeLabel(type: string): string {
  switch (type) {
    case 'PRODUCT_SALE':
      return 'Vente'
    case 'MEAL':
      return 'Souper'
    case 'RAFFLE':
      return 'Tombola'
    default:
      return type
  }
}

function getEventTypeIcon(type: string) {
  switch (type) {
    case 'PRODUCT_SALE':
      return <ShoppingBag className="w-5 h-5" />
    case 'MEAL':
      return <MapPin className="w-5 h-5" />
    case 'RAFFLE':
      return <Calendar className="w-5 h-5" />
    default:
      return <Calendar className="w-5 h-5" />
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

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [adminModalOpen, setAdminModalOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events')
        if (response.ok) {
          const data = await response.json()
          setEvents(data.events || [])
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Mobile: Full-screen landing page
  if (isMobile) {
    return (
      <>
        <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/landing-bg.jpg"
              alt="Background"
              fill
              className="object-cover"
              priority
              quality={100}
            />
            {/* Overlay gradient darker at bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>
          </div>

          {/* Header with logo and admin access - Aligned */}
          <div className="relative z-20 flex items-center justify-between px-5 pt-5">
            {/* Logo scouts en haut à gauche - 56px height with margin */}
            <div className="h-17 w-17 mt-1 animate-fade-in animation-delay-100">
              <Image
                src="/Logo-Scouts-Ecaussinnes-Blanc.png"
                alt="Scouts Écaussinnes"
                width={72}
                height={72}
                className="object-contain drop-shadow-lg"
              />
            </div>

            {/* Admin access with settings icon - 44px height with margin to match logo alignment */}
            <button
              onClick={() => setAdminModalOpen(true)}
              className="animate-fade-in animation-delay-200 h-11 w-11 mt-1 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300 group"
            >
              <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Main Content - Pushed down more */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-end px-6 pb-20 pt-16">
            {/* Baseline - Font identitaire avec espacement réduit */}
            <h1 className="opacity-0 animate-fade-in animation-delay-300 text-6xl font-black text-white text-center leading-[1.0] tracking-tight mb-6">
              Faites vivre<br /><span className="text-amber-300">l'unité</span> & rassemblez<br />
              <span className="text-amber-300">Ecaussinnes</span>
            </h1>

            {/* Explication rapide */}
            <p className="opacity-0 animate-fade-in animation-delay-400 text-[15px] text-white/95 text-center max-w-xs leading-relaxed mb-10 font-normal">
              Participez à nos ventes, soupers et événements pour soutenir les scouts d'Écaussinnes dans leurs projets
            </p>

            {/* CTA Button - Reste visible */}
            <Link
              href="/event/cremant-pionniers-2025"
              className="animate-fade-in animation-delay-[600ms] group relative inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#003f5c] rounded-full font-bold text-base shadow-2xl hover:shadow-white/40 hover:scale-105 transition-all duration-300"
            >
              <span>Réserver et commander</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            {/* Scroll indicator at very bottom - Reste visible */}
            <div className="opacity-0 animate-fade-in animation-delay-[000ms] mt-12 mb-4">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-2 text-center">Faites défiler</p>
              <div className="flex justify-center">
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-[scroll_1.5s_ease-in-out_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Login Modal */}
        <AdminLoginModal
          isOpen={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
        />
      </>
    )
  }

  // Desktop: Keep original design
  // Grouper les événements par section
  const eventsBySection = events.reduce((acc, event) => {
    const sectionSlug = event.section.slug
    if (!acc[sectionSlug]) {
      acc[sectionSlug] = {
        section: event.section,
        events: [],
      }
    }
    acc[sectionSlug].events.push(event)
    return acc
  }, {} as Record<string, { section: Section; events: Event[] }>)

  return (
    <div className="min-h-screen">
      {/* Hero Section - Compact Mobile */}
      <section className="relative overflow-hidden">
        {/* Desktop Header Image (visible on desktop only) */}
        <div
          className="hidden lg:block absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/Header-page-parents.jpg')" }}
        />

        {/* Mobile Background (visible on mobile only) - Compact */}
        <div className="block lg:hidden absolute inset-0 bg-gradient-to-br from-[#003f5c] via-[#2f6690] to-[#7a5195]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-32">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left side - empty space for logo on desktop */}
            <div className="hidden lg:block flex-1"></div>

            {/* Right side - Content - Compact on mobile */}
            <div className="flex-1 text-center lg:text-right">
              {/* Main Title - Smaller on mobile */}
              <h1 className="text-2xl lg:text-6xl font-black mb-2 lg:mb-3 leading-tight tracking-tight text-white lg:text-gray-900">
                Unité <span className="text-amber-300 lg:text-[#5a9fd4]">BR002</span>
              </h1>
              <p className="text-base lg:text-2xl font-bold mb-4 lg:mb-5 text-blue-100 lg:text-gray-700">
                Unité Scoute d'Écaussinnes
              </p>

              {/* CTA Button - Single on mobile */}
              <div className="flex justify-center lg:justify-end">
                <a
                  href="#events"
                  className="inline-flex items-center gap-2 px-6 py-2.5 lg:py-3 bg-white lg:bg-[#003f5c] text-[#003f5c] lg:text-white rounded-full font-semibold text-sm lg:text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Voir les événements
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Simplified for mobile */}
      <section id="about" className="py-8 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile: Simple list / Desktop: Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            {/* Feature 1 */}
            <div className="flex lg:flex-col items-center lg:text-center gap-3 lg:gap-0 p-4 lg:p-6 bg-gray-50 lg:bg-transparent rounded-lg">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-xl lg:rounded-2xl flex items-center justify-center lg:mx-auto lg:mb-4 flex-shrink-0">
                <ShoppingBag className="w-6 h-6 lg:w-8 lg:h-8 text-[#003f5c]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base lg:text-xl font-semibold text-gray-900 mb-1 lg:mb-2">Commandes faciles</h3>
                <p className="text-sm lg:text-base text-gray-600 hidden lg:block">
                  Passez vos commandes en quelques clics
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex lg:flex-col items-center lg:text-center gap-3 lg:gap-0 p-4 lg:p-6 bg-gray-50 lg:bg-transparent rounded-lg">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-xl lg:rounded-2xl flex items-center justify-center lg:mx-auto lg:mb-4 flex-shrink-0">
                <Calendar className="w-6 h-6 lg:w-8 lg:h-8 text-[#003f5c]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base lg:text-xl font-semibold text-gray-900 mb-1 lg:mb-2">Événements variés</h3>
                <p className="text-sm lg:text-base text-gray-600 hidden lg:block">
                  Ventes, soupers, tombolas...
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex lg:flex-col items-center lg:text-center gap-3 lg:gap-0 p-4 lg:p-6 bg-gray-50 lg:bg-transparent rounded-lg">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-xl lg:rounded-2xl flex items-center justify-center lg:mx-auto lg:mb-4 flex-shrink-0">
                <MapPin className="w-6 h-6 lg:w-8 lg:h-8 text-[#003f5c]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base lg:text-xl font-semibold text-gray-900 mb-1 lg:mb-2">Retrait local</h3>
                <p className="text-sm lg:text-base text-gray-600 hidden lg:block">
                  Récupérez à Écaussinnes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section - Simplified */}
      <section id="events" className="py-8 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 lg:mb-12">
            <h2 className="text-xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-4">
              Événements en cours
            </h2>
            <p className="text-sm lg:text-lg text-gray-600 hidden lg:block">
              Découvrez nos ventes et événements actuels
            </p>
          </div>

        {loading ? (
          <div className="text-center py-12 lg:py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#003f5c] border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 lg:py-16 bg-white rounded-xl lg:rounded-2xl shadow-sm">
            <ShoppingBag className="mx-auto h-12 w-12 lg:h-16 lg:w-16 text-gray-300" />
            <h3 className="mt-3 lg:mt-4 text-lg lg:text-xl font-semibold text-gray-900">
              Aucun événement en cours
            </h3>
            <p className="mt-1 lg:mt-2 text-sm lg:text-base text-gray-600 px-4">
              Revenez bientôt pour découvrir nos prochaines ventes!
            </p>
          </div>
        ) : (
          <div className="space-y-8 lg:space-y-12">
            {Object.values(eventsBySection).map(({ section, events }) => (
              <div key={section.id}>
                {/* Section Header - Compact on mobile */}
                <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
                  <div
                    className="w-1 h-6 lg:h-8 rounded-lg"
                    style={{ backgroundColor: section.color }}
                  />
                  <h3 className="text-lg lg:text-3xl font-bold text-gray-900">
                    {section.name}
                  </h3>
                </div>

                {/* Events Grid - Mobile optimized */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                  {events.map((event) => (
                    <Link
                      key={event.id}
                      href={`/event/${event.slug}`}
                      className="group"
                    >
                      <div className="bg-white rounded-lg lg:rounded-xl shadow-sm lg:shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 lg:border-2 lg:border-transparent hover:border-blue-400 transform hover:-translate-y-1">
                        {/* Card Header with Section Color */}
                        <div
                          className="h-1.5 lg:h-2"
                          style={{ backgroundColor: section.color }}
                        />

                        <div className="p-4 lg:p-6">
                          {/* Event Type Badge & Title - Horizontal on mobile */}
                          <div className="flex items-start justify-between gap-3 mb-2 lg:mb-3">
                            <div className="flex-1">
                              <h3 className="text-base lg:text-xl font-bold text-gray-900 group-hover:text-[#003f5c] transition-colors line-clamp-2">
                                {event.name}
                              </h3>
                            </div>
                            <span className="inline-flex items-center gap-1 px-2 lg:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs lg:text-sm font-medium flex-shrink-0">
                              {getEventTypeIcon(event.event_type)}
                              <span className="hidden lg:inline">{getEventTypeLabel(event.event_type)}</span>
                            </span>
                          </div>

                          {/* Description - Hidden on mobile */}
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2 hidden lg:block">
                            {event.description}
                          </p>

                          {/* Date - Compact on mobile */}
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-500 mb-3 lg:mb-4">
                            <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
                            <p>Jusqu'au {formatDate(event.end_date)}</p>
                          </div>

                          {/* Stats - Compact */}
                          {event.stats.ordersCount > 0 && (
                            <div className="pt-2 lg:pt-4 border-t border-gray-100">
                              <p className="text-xs text-gray-500">
                                {event.stats.ordersCount} commande{event.stats.ordersCount > 1 ? 's' : ''}
                              </p>
                            </div>
                          )}

                          {/* CTA */}
                          <div className="mt-3 lg:mt-4">
                            <span className="inline-flex items-center text-[#003f5c] font-semibold text-sm lg:text-base group-hover:text-[#2f6690]">
                              Commander
                              <svg
                                className="ml-1.5 lg:ml-2 w-3.5 h-3.5 lg:w-4 lg:h-4 group-hover:translate-x-1 transition-transform"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </section>
    </div>
  )
}
