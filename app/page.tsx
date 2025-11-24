import Link from 'next/link'
import { Calendar, MapPin, ShoppingBag } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'

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

async function getActiveEvents(): Promise<Event[]> {
  try {
    const supabase = createServerClient() as any

    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        section:sections(
          id,
          name,
          slug,
          color
        )
      `)
      .eq('status', 'ACTIVE')
      .lte('start_date', new Date().toISOString().split('T')[0])
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Erreur récupération événements:', error)
      return []
    }

    // Pour chaque événement, compter les commandes pour stats
    const eventsWithStats = await Promise.all(
      (events || []).map(async (event: any) => {
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .in('status', ['PENDING', 'PAID', 'PREPARED', 'DELIVERED'])

        return {
          ...event,
          stats: {
            ordersCount: ordersCount || 0,
          },
        }
      })
    )

    return eventsWithStats || []
  } catch (error) {
    console.error('Erreur fetch événements:', error)
    return []
  }
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

export default async function HomePage() {
  const events = await getActiveEvents()

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
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Desktop Header Image (visible on desktop only) */}
        <div
          className="hidden lg:block absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/Header-page-parents.jpg')" }}
        />

        {/* Mobile Background (visible on mobile only) */}
        <div className="block lg:hidden absolute inset-0 bg-gradient-to-br from-[#003f5c] via-[#2f6690] to-[#7a5195]">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left side - empty space for logo on desktop */}
            <div className="hidden lg:block flex-1"></div>

            {/* Right side - Content */}
            <div className="flex-1 text-center lg:text-right animate-fade-in">
              {/* Main Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 leading-tight animate-slide-up tracking-tight text-gray-900 lg:text-gray-900">
                Unité <span className="text-[#003f5c] lg:text-[#5a9fd4]">BR002</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl font-bold mb-5 text-white lg:text-gray-700 animate-slide-up animation-delay-100">
                Unité Scoute d'Écaussinnes
              </p>

              {/* Description */}
              <p className="text-sm md:text-base text-blue-50 lg:text-gray-600 max-w-md lg:ml-auto mb-8 leading-relaxed animate-slide-up animation-delay-200">
                Soutenez les activités de notre unité scoute en participant à nos ventes et événements.
                Chaque commande contribue au financement de nos camps et activités.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end items-center animate-slide-up animation-delay-300">
                <a
                  href="#events"
                  className="group px-6 py-3 bg-[#003f5c] text-white rounded-full font-semibold text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    Découvrir les événements
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </a>
                <a
                  href="#about"
                  className="px-6 py-3 border-2 border-white lg:border-[#003f5c] text-white lg:text-[#003f5c] rounded-full font-semibold text-base hover:bg-[#003f5c] hover:text-white transition-all duration-300"
                >
                  En savoir plus
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              À propos de cette plateforme
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Un outil simple et efficace pour gérer les ventes et événements de notre unité scoute
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <ShoppingBag className="w-8 h-8 text-[#003f5c]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Commandes faciles</h3>
              <p className="text-gray-600">
                Passez vos commandes en quelques clics et choisissez votre créneau de retrait
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <Calendar className="w-8 h-8 text-[#003f5c]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Événements variés</h3>
              <p className="text-gray-600">
                Ventes de produits, soupers, tombolas... Découvrez tous nos événements
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <MapPin className="w-8 h-8 text-[#003f5c]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Retrait local</h3>
              <p className="text-gray-600">
                Récupérez vos commandes à Écaussinnes aux créneaux qui vous conviennent
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Événements en cours
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez nos ventes et événements actuels
            </p>
          </div>

        {events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Aucun événement en cours
            </h3>
            <p className="mt-2 text-gray-600">
              Revenez bientôt pour découvrir nos prochaines ventes et événements!
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.values(eventsBySection).map(({ section, events }) => (
              <div key={section.id}>
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-1 h-8 rounded-lg"
                    style={{ backgroundColor: section.color }}
                  />
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {section.name}
                  </h3>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <Link
                      key={event.id}
                      href={`/event/${event.slug}`}
                      className="group animate-fade-in-up"
                    >
                      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-400 transform hover:-translate-y-1">
                        {/* Card Header with Section Color */}
                        <div
                          className="h-2"
                          style={{ backgroundColor: section.color }}
                        />

                        <div className="p-6">
                          {/* Event Type Badge */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium group-hover:bg-blue-200 transition-colors duration-300">
                              {getEventTypeIcon(event.event_type)}
                              {getEventTypeLabel(event.event_type)}
                            </span>
                          </div>

                          {/* Event Title */}
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#003f5c] transition-colors">
                            {event.name}
                          </h3>

                          {/* Description */}
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {event.description}
                          </p>

                          {/* Dates */}
                          <div className="flex items-start gap-2 text-sm text-gray-500 mb-4">
                            <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <p>Jusqu'au {formatDate(event.end_date)}</p>
                            </div>
                          </div>

                          {/* Stats */}
                          {event.stats.ordersCount > 0 && (
                            <div className="pt-4 border-t border-gray-100">
                              <p className="text-xs text-gray-500">
                                {event.stats.ordersCount} commande
                                {event.stats.ordersCount > 1 ? 's' : ''} en cours
                              </p>
                            </div>
                          )}

                          {/* CTA */}
                          <div className="mt-4">
                            <span className="inline-flex items-center text-[#003f5c] font-semibold group-hover:text-[#2f6690]">
                              Commander
                              <svg
                                className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
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
