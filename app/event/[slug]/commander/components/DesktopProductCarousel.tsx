import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Leaf, Sprout, AlertTriangle } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price_cents: number
  product_type: string
  stock: number | null
  image_url: string | null
  allergens?: string[]
  is_vegetarian?: boolean
  is_vegan?: boolean
}

interface DesktopProductCarouselProps {
  products: Product[]
  cart: Record<string, number>
  onAddToCart: (productId: string) => void
  onRemoveFromCart: (productId: string) => void
  onUpdateQuantity: (productId: string, qty: number) => void
}

const getAllergenLabel = (allergenCode: string): string => {
  const allergenLabels: Record<string, string> = {
    gluten: 'Gluten',
    lactose: 'Lactose',
    oeufs: 'Œufs',
    poisson: 'Poisson',
    crustaces: 'Crustacés',
    fruits_a_coque: 'Fruits à coque',
    arachides: 'Arachides',
    soja: 'Soja',
    celeri: 'Céleri',
    moutarde: 'Moutarde',
    sesame: 'Sésame',
    sulfites: 'Sulfites',
    lupin: 'Lupin',
    mollusques: 'Mollusques',
  }
  return allergenLabels[allergenCode] || allergenCode
}

export default function DesktopProductCarousel({
  products,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity,
}: DesktopProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const goToPrevious = () => {
    if (isAnimating || currentIndex === 0) return
    setIsAnimating(true)
    setCurrentIndex(prev => prev - 1)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const goToNext = () => {
    if (isAnimating || currentIndex >= products.length - 1) return
    setIsAnimating(true)
    setCurrentIndex(prev => prev + 1)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const formatPrice = (cents: number): string => {
    return `${(cents / 100).toFixed(2)} €`
  }

  return (
    <div className="relative">
      {/* Navigation buttons */}
      <button
        onClick={goToPrevious}
        disabled={currentIndex === 0 || isAnimating}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all ${
          currentIndex === 0 || isAnimating
            ? 'opacity-30 cursor-not-allowed'
            : 'hover:bg-gray-50 hover:scale-110'
        }`}
        aria-label="Produit précédent"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>

      <button
        onClick={goToNext}
        disabled={currentIndex >= products.length - 1 || isAnimating}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all ${
          currentIndex >= products.length - 1 || isAnimating
            ? 'opacity-30 cursor-not-allowed'
            : 'hover:bg-gray-50 hover:scale-110'
        }`}
        aria-label="Produit suivant"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>

      {/* Carousel container */}
      <div className="overflow-hidden px-16">
        <div
          ref={scrollContainerRef}
          className="flex gap-6 transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / 3)}%)`,
          }}
        >
          {products.map((product, index) => {
            const qty = cart[product.id] || 0
            const remainingStock = product.stock !== null ? product.stock - qty : null
            const isCenter = index === currentIndex
            const isAdjacent = Math.abs(index - currentIndex) === 1
            const isVisible = Math.abs(index - currentIndex) <= 1

            return (
              <div
                key={product.id}
                className={`flex-shrink-0 transition-all duration-300 ${
                  isCenter
                    ? 'w-[calc(100%/3)] opacity-100 scale-100'
                    : isAdjacent
                    ? 'w-[calc(100%/3)] opacity-40 scale-95 blur-[1px] grayscale-[50%]'
                    : 'w-[calc(100%/3)] opacity-0 scale-90'
                }`}
                style={{
                  filter: isCenter ? 'none' : isAdjacent ? 'blur(1px) grayscale(50%)' : 'blur(2px) grayscale(100%)',
                }}
              >
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 h-full flex flex-col">
                  {/* Image */}
                  <div className="w-full aspect-square mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-stone-50 border border-gray-200">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-600">
                        <Sprout className="w-24 h-24" />
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {product.description}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.is_vegan && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          <Sprout className="w-4 h-4" />
                          Vegan
                        </span>
                      )}
                      {product.is_vegetarian && !product.is_vegan && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          <Leaf className="w-4 h-4" />
                          Végétarien
                        </span>
                      )}
                    </div>

                    {/* Allergens */}
                    {product.allergens && product.allergens.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {product.allergens.map((allergen) => (
                          <span
                            key={allergen}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium border border-orange-200"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            {getAllergenLabel(allergen)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stock */}
                    {remainingStock !== null && (
                      <p className={`text-sm font-medium mb-4 ${
                        remainingStock <= 5 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        Stock restant: {remainingStock} / {product.stock}
                      </p>
                    )}

                    {/* Price */}
                    <div className="text-3xl font-bold text-amber-600 mb-6">
                      {formatPrice(product.price_cents)}
                    </div>

                    {/* Quantity controls */}
                    <div className="space-y-3">
                      {qty === 0 ? (
                        <>
                          <button
                            onClick={() => onAddToCart(product.id)}
                            disabled={remainingStock !== null && remainingStock <= 0}
                            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {remainingStock !== null && remainingStock <= 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                          </button>
                          {product.product_type === 'ITEM' && remainingStock !== null && remainingStock >= 6 && (
                            <button
                              onClick={() => onUpdateQuantity(product.id, 6)}
                              className="w-full py-2 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-semibold rounded-lg transition-colors"
                            >
                              🍾 Ajouter une caisse (6 btl)
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-4 justify-center">
                            <button
                              onClick={() => onRemoveFromCart(product.id)}
                              className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-xl transition-colors"
                            >
                              -
                            </button>
                            <span className="w-16 text-center font-bold text-2xl">
                              {qty}
                            </span>
                            <button
                              onClick={() => onAddToCart(product.id)}
                              disabled={remainingStock !== null && remainingStock <= 0}
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-colors ${
                                remainingStock !== null && remainingStock <= 0
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-amber-600 hover:bg-amber-700 text-white'
                              }`}
                            >
                              +
                            </button>
                          </div>
                          {product.product_type === 'ITEM' && remainingStock !== null && remainingStock >= 6 && (
                            <button
                              onClick={() => onUpdateQuantity(product.id, qty + 6)}
                              className="w-full py-2 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-semibold rounded-lg transition-colors"
                            >
                              + Ajouter une caisse (6 btl)
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Indicator dots */}
      <div className="flex justify-center gap-2 mt-6">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true)
                setCurrentIndex(index)
                setTimeout(() => setIsAnimating(false), 300)
              }
            }}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-amber-600'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Aller au produit ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
