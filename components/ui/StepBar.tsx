'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export interface Step {
  id: string
  label: string
  description?: string
  icon?: LucideIcon
  optional?: boolean
}

interface StepBarProps {
  steps: Step[]
  currentStep: number
  completedSteps?: number[]
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  showDescription?: boolean
  className?: string
}

export default function StepBar({
  steps,
  currentStep,
  completedSteps = [],
  orientation = 'horizontal',
  size = 'md',
  showDescription = true,
  className,
}: StepBarProps) {
  const isStepCompleted = (index: number) => completedSteps.includes(index)
  const isStepCurrent = (index: number) => currentStep === index
  const isStepUpcoming = (index: number) => index > currentStep && !completedSteps.includes(index)

  const sizeClasses = {
    sm: {
      circle: 'w-8 h-8',
      icon: 'w-4 h-4',
      label: 'text-xs',
      description: 'text-xs',
      connector: orientation === 'horizontal' ? 'h-0.5' : 'w-0.5',
    },
    md: {
      circle: 'w-10 h-10',
      icon: 'w-5 h-5',
      label: 'text-sm',
      description: 'text-xs',
      connector: orientation === 'horizontal' ? 'h-0.5' : 'w-0.5',
    },
    lg: {
      circle: 'w-12 h-12',
      icon: 'w-6 h-6',
      label: 'text-base',
      description: 'text-sm',
      connector: orientation === 'horizontal' ? 'h-1' : 'w-1',
    },
  }

  const sizes = sizeClasses[size]

  return (
    <div
      className={cn(
        'w-full',
        orientation === 'vertical' ? 'flex flex-col' : 'flex items-start',
        className
      )}
    >
      {steps.map((step, index) => {
        const StepIcon = step.icon
        const completed = isStepCompleted(index)
        const current = isStepCurrent(index)
        const upcoming = isStepUpcoming(index)
        const isLast = index === steps.length - 1

        return (
          <div
            key={step.id}
            className={cn(
              'flex',
              orientation === 'horizontal' ? 'flex-1 items-start' : 'items-start gap-3',
              orientation === 'horizontal' && !isLast ? 'min-w-0' : ''
            )}
          >
            {/* Step Content */}
            <div
              className={cn(
                'flex',
                orientation === 'horizontal' ? 'flex-col items-center' : 'flex-col',
                orientation === 'horizontal' ? 'flex-1' : ''
              )}
            >
              {/* Circle with Icon/Number */}
              <div
                className={cn(
                  'rounded-full flex items-center justify-center font-semibold transition-all duration-300 flex-shrink-0',
                  sizes.circle,
                  completed &&
                    'bg-green-500 text-white shadow-lg shadow-green-500/30',
                  current &&
                    'bg-amber-500 text-white shadow-lg shadow-amber-500/30 ring-4 ring-amber-100',
                  upcoming && 'bg-gray-200 text-gray-500',
                  !isLast && orientation === 'horizontal' ? 'mb-3' : '',
                  orientation === 'vertical' ? 'mb-2' : ''
                )}
              >
                {completed ? (
                  <Check className={cn(sizes.icon, 'stroke-[3]')} />
                ) : StepIcon ? (
                  <StepIcon className={sizes.icon} />
                ) : (
                  <span className={sizes.label}>{index + 1}</span>
                )}
              </div>

              {/* Label and Description */}
              <div
                className={cn(
                  orientation === 'horizontal' ? 'text-center' : 'text-left',
                  orientation === 'horizontal' ? 'w-full' : 'flex-1'
                )}
              >
                <div
                  className={cn(
                    'font-semibold transition-colors duration-300',
                    sizes.label,
                    completed && 'text-green-700',
                    current && 'text-amber-700',
                    upcoming && 'text-gray-500'
                  )}
                >
                  {step.label}
                  {step.optional && (
                    <span className="ml-1 text-xs text-gray-400 font-normal">
                      (optionnel)
                    </span>
                  )}
                </div>

                {showDescription && step.description && (
                  <p
                    className={cn(
                      'mt-1 text-gray-500 leading-tight',
                      sizes.description,
                      orientation === 'horizontal' ? 'hidden sm:block' : ''
                    )}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  'transition-all duration-300',
                  orientation === 'horizontal'
                    ? cn(
                        'flex-1 mt-5 mx-2',
                        sizes.connector,
                        completed || (current && index < currentStep)
                          ? 'bg-green-500'
                          : current
                          ? 'bg-amber-500'
                          : 'bg-gray-200'
                      )
                    : cn(
                        'ml-5 my-2 h-8',
                        sizes.connector,
                        completed || (current && index < currentStep)
                          ? 'bg-green-500'
                          : current
                          ? 'bg-amber-500'
                          : 'bg-gray-200'
                      )
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
