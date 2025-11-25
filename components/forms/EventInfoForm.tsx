'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

export interface EventInfoFormValues {
  name: string
  description: string
  start_date: string
  end_date: string
  pickup_address?: string
  delivery_fee_cents?: number
  delivery_min_bottles?: number
}

interface EventInfoFormProps {
  initialValues?: EventInfoFormValues
  onSubmit: (values: EventInfoFormValues) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export default function EventInfoForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Enregistrer',
}: EventInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<EventInfoFormValues>(
    initialValues || {
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      pickup_address: '',
      delivery_fee_cents: 0,
      delivery_min_bottles: 0,
    }
  )

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseInt(value, 10)) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nom de l'événement */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nom de l'événement <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="Vente de Crémant"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="Description de l'événement..."
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
            Date de début <span className="text-red-500">*</span>
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            required
            value={formData.start_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin <span className="text-red-500">*</span>
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            required
            value={formData.end_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Adresse de retrait */}
      <div>
        <label htmlFor="pickup_address" className="block text-sm font-medium text-gray-700 mb-1">
          Adresse de retrait
        </label>
        <input
          id="pickup_address"
          name="pickup_address"
          type="text"
          value={formData.pickup_address || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="Rue des fontenelles 26, Ecaussinnes"
        />
        <p className="text-xs text-gray-500 mt-1">
          Adresse où les clients pourront retirer leur commande
        </p>
      </div>

      {/* Configuration livraison */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="delivery_fee_cents" className="block text-sm font-medium text-gray-700 mb-1">
            Frais de livraison (centimes)
          </label>
          <input
            id="delivery_fee_cents"
            name="delivery_fee_cents"
            type="number"
            min="0"
            value={formData.delivery_fee_cents || 0}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ex: 500 pour 5,00 €
          </p>
        </div>

        <div>
          <label htmlFor="delivery_min_bottles" className="block text-sm font-medium text-gray-700 mb-1">
            Minimum pour livraison
          </label>
          <input
            id="delivery_min_bottles"
            name="delivery_min_bottles"
            type="number"
            min="0"
            value={formData.delivery_min_bottles || 0}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Nombre minimum de bouteilles
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {isSubmitting ? 'Enregistrement...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
