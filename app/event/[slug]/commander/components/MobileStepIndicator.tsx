import React from 'react'
import { ShoppingCart, Truck, Calendar, User, CreditCard } from 'lucide-react'

export interface MobileStep {
  id: string
  icon: React.ReactNode
  label: string
}

interface MobileStepIndicatorProps {
  currentStep: number
  totalSteps: number
  steps: MobileStep[]
}

/**
 * Indicateur d'étapes compact pour mobile
 * Affiche seulement les icônes et une barre de progression
 */
export default function MobileStepIndicator({
  currentStep,
  totalSteps,
  steps,
}: MobileStepIndicatorProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep + 1) / totalSteps) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Step icons */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep

          return (
            <div key={step.id} className="flex flex-col items-center gap-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${isActive ? 'bg-amber-600 text-white scale-110 shadow-md' : ''}
                  ${isCompleted ? 'bg-green-600 text-white' : ''}
                  ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-400' : ''}
                `}
              >
                {step.icon}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? 'text-amber-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {index + 1}
              </span>
            </div>
          )
        })}
      </div>

      {/* Current step label */}
      <div className="mt-3 text-center">
        <p className="text-sm font-semibold text-gray-900">
          {steps[currentStep]?.label}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          Étape {currentStep + 1} sur {totalSteps}
        </p>
      </div>
    </div>
  )
}

// Export des icônes par défaut pour faciliter l'usage
export const defaultMobileSteps: MobileStep[] = [
  {
    id: 'products',
    icon: <ShoppingCart className="w-5 h-5" />,
    label: 'Produits',
  },
  {
    id: 'delivery',
    icon: <Truck className="w-5 h-5" />,
    label: 'Livraison',
  },
  {
    id: 'slot',
    icon: <Calendar className="w-5 h-5" />,
    label: 'Créneau',
  },
  {
    id: 'info',
    icon: <User className="w-5 h-5" />,
    label: 'Informations',
  },
  {
    id: 'payment',
    icon: <CreditCard className="w-5 h-5" />,
    label: 'Paiement',
  },
]
