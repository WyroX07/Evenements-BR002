import React from 'react'
import { Minus, Plus, Info, Leaf, Sprout } from 'lucide-react'
import Image from 'next/image'

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

interface MobileProductCardProps {
  product: Product
  quantity: number
  onQuantityChange: (qty: number) => void
  onShowDetails: () => void
}

/**
 * Carte produit compacte pour mobile
 */
export default function MobileProductCard({
  product,
  quantity,
  onQuantityChange,
  onShowDetails,
}: MobileProductCardProps) {
  const formatPrice = (cents: number): string => {
    return `${(cents / 100).toFixed(2)} €`
  }

  const handleIncrement = () => {
    onQuantityChange(quantity + 1)
  }

  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(quantity - 1)
    }
  }

  const handleAddCase = () => {
    onQuantityChange(quantity + 6)
  }

  // Calculer le stock restant en tenant compte du panier
  const remainingStock = product.stock !== null ? product.stock - quantity : null

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden active:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex gap-3">
          {/* Image compacte */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-stone-50 rounded-lg overflow-hidden border border-gray-200">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-600">
                  <Sprout className="w-8 h-8" />
                </div>
              )}
            </div>
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {product.name}
              </h3>
              <button
                onClick={onShowDetails}
                className="flex-shrink-0 p-1.5 text-amber-600 hover:bg-amber-50 rounded-md active:scale-95 transition-all"
                aria-label="Voir les détails"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {/* Description tronquée */}
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {product.description}
            </p>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-2">
              {product.is_vegan && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  <Leaf className="w-3 h-3" />
                  Vegan
                </span>
              )}
              {product.is_vegetarian && !product.is_vegan && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  <Sprout className="w-3 h-3" />
                  Végé
                </span>
              )}
              {product.allergens && product.allergens.length > 0 && (
                <span className="text-xs text-gray-500">
                  +{product.allergens.length} allergène{product.allergens.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Stock */}
            {remainingStock !== null && (
              <div className="mb-2">
                <p className={`text-xs font-medium ${
                  remainingStock < 10 ? 'text-orange-600' : 'text-gray-600'
                }`}>
                  {remainingStock > 0
                    ? `${remainingStock} en stock`
                    : 'Rupture de stock'}
                </p>
              </div>
            )}

            {/* Prix et quantité */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-amber-700">
                {formatPrice(product.price_cents)}
              </span>

              {/* Contrôles quantité compacts */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDecrement}
                  disabled={quantity === 0}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 text-gray-700 active:scale-95 active:bg-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Diminuer la quantité"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="min-w-[2rem] text-center font-semibold text-gray-900">
                  {quantity}
                </span>

                <button
                  onClick={handleIncrement}
                  disabled={remainingStock !== null && remainingStock <= 0}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-amber-600 text-white active:scale-95 active:bg-amber-700 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Augmenter la quantité"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bouton ajouter caisse de 6 */}
            {product.product_type !== 'ADDON' && (
              <div className="mt-3">
                <button
                  onClick={handleAddCase}
                  disabled={remainingStock !== null && remainingStock < 6}
                  className="w-full py-1.5 md:py-1 px-3 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-800 text-xs md:text-[11px] font-semibold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + Ajouter une caisse de 6
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
