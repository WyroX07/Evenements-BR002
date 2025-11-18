/**
 * StepBar Component - Usage Examples
 *
 * This file demonstrates how to use the StepBar component in different scenarios.
 * DO NOT import this file in production code - it's for reference only.
 */

import StepBar, { Step } from './StepBar'
import { Calendar, Package, Clock, CreditCard, CheckCircle } from 'lucide-react'

// Example 1: Event Creation Flow (Horizontal, Large)
export function EventCreationStepBar() {
  const steps: Step[] = [
    {
      id: 'details',
      label: 'Détails',
      description: "Informations de l'événement",
      icon: Calendar,
    },
    {
      id: 'products',
      label: 'Produits',
      description: 'Ajouter des produits',
      icon: Package,
      optional: true, // Optional step
    },
    {
      id: 'slots',
      label: 'Créneaux',
      description: 'Planifier les retraits',
      icon: Clock,
      optional: true, // Optional step
    },
    {
      id: 'review',
      label: 'Vérification',
      description: 'Confirmer et publier',
      icon: CheckCircle,
    },
  ]

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <StepBar
        steps={steps}
        currentStep={1}
        completedSteps={[0]}
        orientation="horizontal"
        size="lg"
        showDescription={true}
      />
    </div>
  )
}

// Example 2: Order Process (Horizontal, Medium)
export function OrderProcessStepBar() {
  const steps: Step[] = [
    {
      id: 'products',
      label: 'Sélection',
      description: 'Choisir vos produits',
      icon: Package,
    },
    {
      id: 'slot',
      label: 'Créneau',
      description: 'Choisir le retrait',
      icon: Clock,
    },
    {
      id: 'contact',
      label: 'Coordonnées',
      description: 'Vos informations',
    },
    {
      id: 'payment',
      label: 'Paiement',
      description: 'Finaliser la commande',
      icon: CreditCard,
    },
  ]

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <StepBar
        steps={steps}
        currentStep={2}
        completedSteps={[0, 1]}
        orientation="horizontal"
        size="md"
      />
    </div>
  )
}

// Example 3: Vertical Layout (for sidebar/mobile)
export function VerticalStepBar() {
  const steps: Step[] = [
    {
      id: 'step1',
      label: 'Étape 1',
      description: 'Configuration initiale',
    },
    {
      id: 'step2',
      label: 'Étape 2',
      description: 'Paramètres avancés',
      optional: true,
    },
    {
      id: 'step3',
      label: 'Étape 3',
      description: 'Finalisation',
    },
  ]

  return (
    <div className="p-4 bg-white rounded-lg max-w-xs">
      <StepBar
        steps={steps}
        currentStep={1}
        completedSteps={[0]}
        orientation="vertical"
        size="md"
      />
    </div>
  )
}

// Example 4: Simple numbered steps (no icons)
export function SimpleStepBar() {
  const steps: Step[] = [
    {
      id: 'step1',
      label: 'Informations',
    },
    {
      id: 'step2',
      label: 'Validation',
    },
    {
      id: 'step3',
      label: 'Confirmation',
    },
  ]

  return (
    <StepBar
      steps={steps}
      currentStep={1}
      completedSteps={[0]}
      showDescription={false}
      size="sm"
    />
  )
}

// Example 5: All steps completed
export function CompletedStepBar() {
  const steps: Step[] = [
    {
      id: 'step1',
      label: 'Commande',
      icon: Package,
    },
    {
      id: 'step2',
      label: 'Paiement',
      icon: CreditCard,
    },
    {
      id: 'step3',
      label: 'Confirmé',
      icon: CheckCircle,
    },
  ]

  return (
    <StepBar
      steps={steps}
      currentStep={2}
      completedSteps={[0, 1, 2]}
      size="md"
    />
  )
}

/**
 * USAGE NOTES:
 *
 * Props:
 * - steps: Array of Step objects (id, label, description?, icon?, optional?)
 * - currentStep: Index of the current active step (0-based)
 * - completedSteps: Array of indices for completed steps
 * - orientation: 'horizontal' | 'vertical' (default: 'horizontal')
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - showDescription: boolean (default: true)
 * - className: Additional CSS classes
 *
 * Step States:
 * - Completed: Green with checkmark icon
 * - Current: Amber/orange with ring, shows icon or number
 * - Upcoming: Gray, shows icon or number
 *
 * Features:
 * - Responsive design (descriptions hidden on mobile for horizontal)
 * - Smooth transitions between states
 * - Optional steps marked with "(optionnel)"
 * - Custom icons support from lucide-react
 * - Numbered fallback when no icon provided
 * - Connector lines between steps (colored based on completion)
 */
