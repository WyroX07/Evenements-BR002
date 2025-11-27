import React from 'react'
import Button from '@/components/ui/Button'

interface MobileStickyFooterProps {
  totalCents: number
  itemCount: number
  buttonLabel: string
  buttonDisabled: boolean
  onButtonClick: () => void
  additionalInfo?: string
  isLoading?: boolean
}

/**
 * Footer sticky en bas de l'écran mobile
 * Affiche le total et un CTA
 */
export default function MobileStickyFooter({
  totalCents,
  itemCount,
  buttonLabel,
  buttonDisabled,
  onButtonClick,
  additionalInfo,
  isLoading = false,
}: MobileStickyFooterProps) {
  const formatPrice = (cents: number): string => {
    return `${(cents / 100).toFixed(2)} €`
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-amber-200 shadow-lg z-40 safe-area-inset-bottom">
      <div className="px-4 py-3">
        {/* Résumé rapide */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs text-gray-600">
              {itemCount} {itemCount > 1 ? 'articles' : 'article'}
            </p>
            {additionalInfo && (
              <p className="text-xs text-amber-700 mt-0.5">{additionalInfo}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">
              {formatPrice(totalCents)}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onButtonClick}
          disabled={buttonDisabled || isLoading}
          className="w-full min-h-[48px] bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold shadow-md active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Chargement...' : buttonLabel}
        </Button>
      </div>
    </div>
  )
}
