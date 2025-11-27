'use client'

import Image from 'next/image'
import ResponsiveModal from '@/components/ui/ResponsiveModal'
import { Wine, MapPin, Award, UtensilsCrossed, Sparkles } from 'lucide-react'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    name: string
    producer?: string
    origin?: string
    grape_variety?: string
    vintage?: string
    wine_type?: string
    appellation?: string
    color?: string
    aromas?: string
    balance?: string
    food_pairing?: string
    conservation?: string
    residual_sugar?: string
    special_mentions?: string
    price: number
    image_url?: string
    stock_qty?: number
    is_limited_edition?: boolean
    product_type: string
  }
}

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const hasLimitedStock = product.stock_qty !== undefined && product.stock_qty > 0 && product.stock_qty <= 50

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      showCloseButton={true}
    >
      {/* Background pattern - topographic style */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none hidden md:block">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="topographic" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M20 20c0-20 20-20 20 0s20 20 20 0 20-20 20 0" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <path d="M0 40c20 0 20-20 40-20s20 20 40 20 20-20 40-20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <path d="M0 60c20 0 20 20 40 20s20-20 40-20 20 20 40 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topographic)"/>
        </svg>
      </div>

      <div className="relative grid md:grid-cols-2 gap-6 md:gap-12 md:-mt-8">
        {/* Left column - Image */}
        <div className="relative">
          {/* Decorative line - top (desktop only) */}
          <div className="absolute -top-6 left-0 w-20 h-px bg-gradient-to-r from-amber-600 to-transparent hidden md:block"></div>

          {/* Product Image */}
          <div className="relative aspect-[4/5] md:aspect-[3/4] rounded-sm overflow-hidden bg-gradient-to-br from-stone-50 to-amber-50/20 border border-stone-200/50">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-contain p-6 md:p-10"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Wine className="w-16 h-16 md:w-24 md:h-24 text-stone-300" />
              </div>
            )}

            {/* Limited badge - elegant corner ribbon */}
            {hasLimitedStock && (
              <div className="absolute top-0 right-0">
                <div className="relative bg-gradient-to-br from-red-600 to-red-700 text-white px-4 md:px-6 py-1.5 md:py-2 shadow-lg">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    <span className="text-[10px] md:text-xs font-semibold tracking-wide uppercase">Stock limité</span>
                  </div>
                  <div className="text-center text-[9px] md:text-[10px] opacity-90 mt-0.5">
                    {product.stock_qty} disponibles
                  </div>
                  {/* Triangle decoration */}
                  <div className="absolute -bottom-1.5 md:-bottom-2 right-0 w-0 h-0 border-t-[6px] md:border-t-[8px] border-t-red-900 border-l-[6px] md:border-l-[8px] border-l-transparent"></div>
                </div>
              </div>
            )}

            {product.is_limited_edition && !hasLimitedStock && (
              <div className="absolute top-0 right-0">
                <div className="relative bg-gradient-to-br from-amber-600 to-amber-700 text-white px-4 md:px-6 py-1.5 md:py-2 shadow-lg">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Award className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    <span className="text-[10px] md:text-xs font-semibold tracking-wide uppercase">Édition limitée</span>
                  </div>
                  <div className="absolute -bottom-1.5 md:-bottom-2 right-0 w-0 h-0 border-t-[6px] md:border-t-[8px] border-t-amber-900 border-l-[6px] md:border-l-[8px] border-l-transparent"></div>
                </div>
              </div>
            )}
          </div>

          {/* Vintage & Origin info cards - stacked elegantly */}
          <div className="mt-4 md:mt-6 space-y-2 md:space-y-3">
            {product.vintage && (
              <div className="bg-stone-900 text-stone-100 p-4 md:p-5 border-l-4 border-amber-600">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-stone-400 mb-1 font-light">Millésime</div>
                    <div className="text-3xl md:text-4xl font-light tracking-tight">{product.vintage}</div>
                  </div>
                  {product.wine_type && (
                    <div className="text-right">
                      <div className="text-xs text-stone-400">{product.wine_type}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(product.producer || product.origin) && (
              <div className="bg-gradient-to-br from-amber-50 to-stone-50 p-4 md:p-5 border border-amber-200/50">
                <div className="space-y-2">
                  {product.producer && (
                    <div className="flex items-center gap-2 text-stone-700">
                      <Wine className="w-4 h-4 text-amber-700" />
                      <span className="text-sm font-medium">{product.producer}</span>
                    </div>
                  )}
                  {product.origin && (
                    <div className="flex items-center gap-2 text-stone-600">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      <span className="text-sm">{product.origin}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Content */}
        <div className="space-y-6 md:space-y-8">
          {/* Header with decorative elements */}
          <div className="relative">
            {/* Small decorative element (desktop only) */}
            <div className="absolute -left-4 top-0 w-1 h-12 bg-gradient-to-b from-amber-600 to-transparent hidden md:block"></div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-stone-900 leading-tight tracking-tight mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              {product.name}
            </h2>

            {product.appellation && (
              <div className="inline-block">
                <div className="flex items-center gap-2 px-3 md:px-4 py-1 md:py-1.5 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white text-xs md:text-sm">
                  <Award className="w-3 md:w-3.5 h-3 md:h-3.5" />
                  <span className="tracking-wide font-medium">{product.appellation}</span>
                </div>
              </div>
            )}
          </div>

          {/* Price - Large and elegant */}
          <div className="py-4 md:py-6 border-y border-stone-200">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-stone-500 mb-2 font-light">Prix unitaire</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-6xl font-light text-stone-900 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                    {(product.price / 100).toFixed(2)}
                  </span>
                  <span className="text-xl md:text-2xl text-stone-500 font-light">€</span>
                </div>
                <div className="text-xs text-stone-500 mt-1 tracking-wide">par bouteille</div>
              </div>

              {product.product_type === 'ITEM' && (
                <div className="text-right">
                  <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-stone-500 mb-1">Caisse de 6</div>
                  <div className="text-xl md:text-2xl font-light text-emerald-700" style={{ fontFamily: 'Georgia, serif' }}>
                    {((product.price * 6) / 100).toFixed(2)} €
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Wine specifications - Elegant grid */}
          {(product.grape_variety || product.color || product.residual_sugar) && (
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-stone-500 font-light">Caractéristiques</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {product.grape_variety && (
                  <div className="group">
                    <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-stone-400 mb-1.5">Cépage</div>
                    <div className="text-sm text-stone-900 font-medium pb-2 border-b border-stone-200 group-hover:border-amber-600 transition-colors">
                      {product.grape_variety}
                    </div>
                  </div>
                )}
                {product.color && (
                  <div className="group">
                    <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-stone-400 mb-1.5">Robe</div>
                    <div className="text-sm text-stone-900 font-medium pb-2 border-b border-stone-200 group-hover:border-amber-600 transition-colors">
                      {product.color}
                    </div>
                  </div>
                )}
                {product.residual_sugar && (
                  <div className="group col-span-2">
                    <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-stone-400 mb-1.5">Sucre résiduel</div>
                    <div className="text-sm text-stone-900 font-medium pb-2 border-b border-stone-200 group-hover:border-amber-600 transition-colors">
                      {product.residual_sugar}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tasting notes - Premium section */}
          {(product.aromas || product.balance) && (
            <div className="relative bg-gradient-to-br from-stone-50 to-amber-50/30 p-4 md:p-6 border border-stone-200/50">
              {/* Decorative corner accent (desktop only) */}
              <div className="absolute top-0 left-0 w-12 md:w-16 h-12 md:h-16 border-t-2 border-l-2 border-amber-600/30 hidden md:block"></div>
              <div className="absolute bottom-0 right-0 w-12 md:w-16 h-12 md:h-16 border-b-2 border-r-2 border-amber-600/30 hidden md:block"></div>

              <h3 className="text-xs uppercase tracking-widest text-stone-500 mb-4 font-light">Dégustation</h3>
              <div className="space-y-4 text-sm leading-relaxed">
                {product.aromas && (
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold">Nez • </span>
                    <span className="text-stone-700">{product.aromas}</span>
                  </div>
                )}
                {product.balance && (
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold">Bouche • </span>
                    <span className="text-stone-700">{product.balance}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Food pairing - Featured with icon */}
          {product.food_pairing && (
            <div className="relative bg-gradient-to-br from-emerald-900 to-emerald-950 text-emerald-50 p-4 md:p-6 overflow-hidden">
              {/* Decorative background pattern */}
              <div className="absolute inset-0 opacity-5 hidden md:block">
                <UtensilsCrossed className="absolute top-4 right-4 w-32 h-32 rotate-12" />
              </div>

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <UtensilsCrossed className="w-4 md:w-5 h-4 md:h-5 text-emerald-400" />
                  <h3 className="text-xs uppercase tracking-widest font-light text-emerald-300">Accords mets & vin</h3>
                </div>
                <p className="text-sm leading-relaxed text-emerald-100">{product.food_pairing}</p>
              </div>
            </div>
          )}

          {/* Conservation & Special mentions */}
          <div className="space-y-3 text-xs">
            {product.conservation && (
              <div className="flex gap-3 text-stone-600">
                <span className="text-stone-400 min-w-[80px] uppercase tracking-wider text-[10px]">Conservation</span>
                <span className="text-stone-700 leading-relaxed">{product.conservation}</span>
              </div>
            )}
            {product.special_mentions && (
              <div className="flex gap-3">
                <span className="text-amber-600 min-w-[80px] uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Note
                </span>
                <span className="text-stone-700 leading-relaxed font-medium">{product.special_mentions}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ResponsiveModal>
  )
}
