import React, { useEffect } from 'react'
import { X, Minus, Plus, Leaf, Sprout, AlertTriangle } from 'lucide-react'
import Button from '@/components/ui/Button'

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

interface ProductDetailsModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  quantity: number
  onAddToCart: (qty: number) => void
}

// Helper pour formater les allergènes
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

/**
 * Modal slide-up pour afficher les détails complets d'un produit
 */
export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  quantity: initialQuantity,
  onAddToCart,
}: ProductDetailsModalProps) {
  const [localQuantity, setLocalQuantity] = React.useState(initialQuantity)

  useEffect(() => {
    setLocalQuantity(initialQuantity)
  }, [initialQuantity, product])

  // Bloquer le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !product) return null

  const formatPrice = (cents: number): string => {
    return `${(cents / 100).toFixed(2)} €`
  }

  const handleIncrement = () => {
    setLocalQuantity(prev => prev + 1)
  }

  const handleDecrement = () => {
    if (localQuantity > 0) {
      setLocalQuantity(prev => prev - 1)
    }
  }

  const handleAddToCart = () => {
    onAddToCart(localQuantity)
    onClose()
  }

  const handleAddCase = () => {
    setLocalQuantity(prev => prev + 6)
  }

  // Calculer le stock restant
  const remainingStock = product ? (product.stock !== null ? product.stock - localQuantity : null) : null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Content - Slide up from bottom */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slideUp">
        <div className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
          {/* Header sticky */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
            <h2 className="text-lg font-bold text-gray-900 pr-8">
              {product.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full active:scale-95 transition-all"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {/* Image */}
            <div className="w-full aspect-square bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl mb-6 flex items-center justify-center border border-gray-200 overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Sprout className="w-24 h-24 text-amber-600/30" />
              )}
            </div>

            {/* Prix */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-amber-700">
                {formatPrice(product.price_cents)}
              </span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.is_vegan && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  <Leaf className="w-4 h-4" />
                  Vegan
                </span>
              )}
              {product.is_vegetarian && !product.is_vegan && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  <Sprout className="w-4 h-4" />
                  Végétarien
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Allergènes */}
            {product.allergens && product.allergens.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  Allergènes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.allergens.map((allergen) => (
                    <span
                      key={allergen}
                      className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200"
                    >
                      {getAllergenLabel(allergen)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            {remainingStock !== null && (
              <div className="mb-6">
                <p className={`text-sm font-medium ${
                  remainingStock < 10 ? 'text-orange-600' : 'text-gray-600'
                }`}>
                  {remainingStock > 0
                    ? `${remainingStock} en stock`
                    : 'Rupture de stock'}
                </p>
              </div>
            )}

            {/* Contrôles quantité */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Quantité
              </h3>
              <div className="flex items-center justify-center gap-4 bg-gray-50 rounded-xl p-4">
                <button
                  onClick={handleDecrement}
                  disabled={localQuantity === 0}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white border-2 border-gray-300 text-gray-700 active:scale-95 active:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                  aria-label="Diminuer"
                >
                  <Minus className="w-5 h-5" />
                </button>

                <span className="text-3xl font-bold text-gray-900 min-w-[3rem] text-center">
                  {localQuantity}
                </span>

                <button
                  onClick={handleIncrement}
                  disabled={remainingStock !== null && remainingStock <= 0}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-amber-600 text-white active:scale-95 active:bg-amber-700 transition-all shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Augmenter"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bouton ajouter caisse de 6 */}
            {product.product_type !== 'ADDON' && (
              <div className="mb-6">
                <button
                  onClick={handleAddCase}
                  disabled={remainingStock !== null && remainingStock < 6}
                  className="w-full py-3 px-4 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-800 text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + Ajouter une caisse de 6
                </button>
              </div>
            )}

            {/* Total */}
            <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Total ({localQuantity} {localQuantity > 1 ? 'articles' : 'article'})
                </span>
                <span className="text-2xl font-bold text-amber-700">
                  {formatPrice(product.price_cents * localQuantity)}
                </span>
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={handleAddToCart}
              className="w-full min-h-[52px] bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-base shadow-lg active:scale-[0.98] transition-all"
            >
              {localQuantity > 0 ? 'Mettre à jour le panier' : 'Ajouter au panier'}
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
