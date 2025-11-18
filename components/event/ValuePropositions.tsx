import { Star, TrendingDown, Heart, Truck, Leaf, MapPin } from 'lucide-react'
import type { ValueProposition } from '@/types/event'

interface ValuePropositionsProps {
  items: ValueProposition[]
  sectionColor?: string
}

const iconMap = {
  quality: Star,
  price: TrendingDown,
  support: Heart,
  delivery: Truck,
  eco: Leaf,
  local: MapPin,
  custom: null,
}

export default function ValuePropositions({
  items,
  sectionColor = '#F59E0B',
}: ValuePropositionsProps) {
  if (!items || items.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((item, index) => {
          const IconComponent = item.icon !== 'custom' ? iconMap[item.icon] : null

          return (
            <div
              key={index}
              className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ backgroundColor: `${sectionColor}20` }}
              >
                {IconComponent ? (
                  <IconComponent className="w-8 h-8" style={{ color: sectionColor }} />
                ) : item.custom_icon ? (
                  <span className="text-3xl">{item.custom_icon}</span>
                ) : (
                  <Star className="w-8 h-8" style={{ color: sectionColor }} />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
