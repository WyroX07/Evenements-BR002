'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Clock, Users as UsersIcon } from 'lucide-react'

interface Slot {
  id: string
  date: string
  start_time: string
  end_time: string
  capacity: number
  remainingCapacity?: number
  isFull?: boolean
}

interface ClientSlotDisplayProps {
  slots: Slot[]
  eventType: 'PRODUCT_SALE' | 'MEAL' | 'RAFFLE'
  sectionColor: string
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-BE', {
    day: 'numeric',
    month: 'short',
  })
}

export default function ClientSlotDisplay({
  slots,
  eventType,
  sectionColor,
}: ClientSlotDisplayProps) {
  const [expandedDates, setExpandedDates] = useState<string[]>([])
  const [expandAll, setExpandAll] = useState(false)

  // Grouper les créneaux par date
  const slotsByDate = useMemo(() => {
    const grouped = slots.reduce(
      (acc, slot) => {
        if (!acc[slot.date]) {
          acc[slot.date] = []
        }
        acc[slot.date].push(slot)
        return acc
      },
      {} as Record<string, Slot[]>
    )

    // Trier chaque groupe par heure de début
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => a.start_time.localeCompare(b.start_time))
    })

    return grouped
  }, [slots])

  const sortedDates = useMemo(() => {
    return Object.keys(slotsByDate).sort((a, b) => a.localeCompare(b))
  }, [slotsByDate])

  const toggleDate = (date: string) => {
    setExpandedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    )
  }

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedDates([])
    } else {
      setExpandedDates(sortedDates)
    }
    setExpandAll(!expandAll)
  }

  // Calculer les statistiques par date
  const getDateStats = (dateSlots: Slot[]) => {
    const totalSlots = dateSlots.length
    const availableSlots = dateSlots.filter((s) => !s.isFull).length
    const totalCapacity = dateSlots.reduce((sum, s) => sum + s.capacity, 0)
    const totalBooked = dateSlots.reduce(
      (sum, s) => sum + (s.capacity - (s.remainingCapacity ?? s.capacity)),
      0
    )
    const remainingCapacity = totalCapacity - totalBooked

    return {
      totalSlots,
      availableSlots,
      totalCapacity,
      remainingCapacity,
      percentageFull: totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0,
    }
  }

  const getSectionTitle = () => {
    switch (eventType) {
      case 'PRODUCT_SALE':
        return 'Créneaux de retrait au local'
      case 'MEAL':
        return 'Dates disponibles'
      case 'RAFFLE':
        return 'Dates de tirage'
      default:
        return 'Créneaux disponibles'
    }
  }

  const getSectionBadge = () => {
    switch (eventType) {
      case 'PRODUCT_SALE':
        return 'Retraits'
      case 'MEAL':
        return 'Dates'
      case 'RAFFLE':
        return 'Tirages'
      default:
        return 'Créneaux'
    }
  }

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
            style={{
              backgroundColor: sectionColor + '15',
              color: sectionColor,
            }}
          >
            {getSectionBadge()}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {getSectionTitle()}
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            {eventType === 'PRODUCT_SALE' &&
              'Visualisez ci-dessous les créneaux disponibles pour retirer votre commande au local'}
            {eventType === 'MEAL' && 'Choisissez la date qui vous convient'}
            {eventType === 'RAFFLE' && 'Dates où les tirages auront lieu'}
          </p>
        </div>

        {/* Expand/Collapse All Button */}
        {sortedDates.length > 3 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleExpandAll}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors"
            >
              {expandAll ? (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Tout replier
                </>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4" />
                  Tout déplier
                </>
              )}
            </button>
          </div>
        )}

        {/* Slots grouped by date */}
        <div className="space-y-4">
          {sortedDates.map((date) => {
            const dateSlots = slotsByDate[date]
            const isExpanded = expandedDates.includes(date)
            const stats = getDateStats(dateSlots)

            return (
              <div
                key={date}
                className="bg-white rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  boxShadow: `0 4px 20px ${sectionColor}10`,
                  border: `1px solid ${sectionColor}08`,
                }}
              >
                {/* Date Header - Clickable */}
                <button
                  onClick={() => toggleDate(date)}
                  className="w-full px-6 py-5 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Chevron Icon */}
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300"
                    style={{
                      backgroundColor: sectionColor + '15',
                      transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                    }}
                  >
                    <ChevronDown className="w-4 h-4" style={{ color: sectionColor }} />
                  </div>

                  {/* Date Info */}
                  <div className="flex-1 text-left">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">
                      {formatDate(date)}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {stats.totalSlots} créneau{stats.totalSlots > 1 ? 'x' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <UsersIcon className="w-4 h-4" />
                        {stats.remainingCapacity} place{stats.remainingCapacity > 1 ? 's' : ''}{' '}
                        disponible{stats.remainingCapacity > 1 ? 's' : ''}
                      </span>
                      {stats.availableSlots === 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                          Date complète
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="hidden md:block flex-shrink-0 w-32">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${stats.percentageFull}%`,
                          backgroundColor:
                            stats.percentageFull === 100 ? '#EF4444' : sectionColor,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {Math.round(stats.percentageFull)}% réservé
                    </p>
                  </div>
                </button>

                {/* Slots List - Collapsible */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {dateSlots.map((slot) => {
                        const bookedCount = slot.capacity - (slot.remainingCapacity ?? slot.capacity)
                        const percentageFull =
                          slot.capacity > 0 ? (bookedCount / slot.capacity) * 100 : 0

                        return (
                          <div
                            key={slot.id}
                            className={`relative p-4 rounded-xl border-2 transition-all ${
                              slot.isFull
                                ? 'bg-gray-50 border-gray-200'
                                : 'bg-white border-gray-200 hover:border-opacity-50'
                            }`}
                            style={
                              !slot.isFull
                                ? {
                                    borderColor: sectionColor + '30',
                                  }
                                : undefined
                            }
                          >
                            {/* Time */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span
                                  className={`font-semibold ${
                                    slot.isFull ? 'text-gray-500' : 'text-gray-900'
                                  }`}
                                >
                                  {slot.start_time} - {slot.end_time}
                                </span>
                              </div>

                              {slot.isFull && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                                  Complet
                                </span>
                              )}
                            </div>

                            {/* Capacity Info */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Places disponibles</span>
                                <span
                                  className="font-bold"
                                  style={{
                                    color: slot.isFull ? '#6B7280' : sectionColor,
                                  }}
                                >
                                  {slot.remainingCapacity ?? slot.capacity} / {slot.capacity}
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${percentageFull}%`,
                                    backgroundColor: slot.isFull ? '#9CA3AF' : sectionColor,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Footer info for this date */}
                    <div
                      className="px-6 py-3 text-xs text-center"
                      style={{
                        backgroundColor: sectionColor + '05',
                        color: sectionColor,
                      }}
                    >
                      💡 Vous sélectionnerez votre créneau lors de la commande
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Help text */}
        <div className="mt-8 text-center space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 max-w-3xl mx-auto">
            <p className="text-sm text-blue-900 font-medium mb-2">
              📦 Retrait au local
            </p>
            <p className="text-sm text-blue-800">
              Les créneaux ci-dessus correspondent aux dates et heures où vous pourrez retirer votre commande au local. Vous choisirez votre créneau lors de la commande.
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 max-w-3xl mx-auto">
            <p className="text-sm text-amber-900 font-medium mb-2">
              🚗 Livraison à domicile
            </p>
            <p className="text-sm text-amber-800">
              Les livraisons se feront le 20, 21 ou 22 décembre en fonction de nos disponibilités et de vos préférences. Les horaires sont variables et seront convenus avec vous.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
