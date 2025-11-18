'use client'

import React from 'react'
import { useForm, FormErrors } from '@/hooks/useForm'
import FormField from './FormField'
import Button from '@/components/ui/Button'

export interface SlotFormValues {
  date: string
  start_time: string
  end_time: string
  capacity: number
}

export interface SlotFormProps {
  initialValues?: Partial<SlotFormValues>
  onSubmit: (values: SlotFormValues) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  isLoading?: boolean
}

const defaultValues: SlotFormValues = {
  date: '',
  start_time: '',
  end_time: '',
  capacity: 20,
}

const validateSlot = (values: SlotFormValues): FormErrors => {
  const errors: FormErrors = {}

  if (!values.date) {
    errors.date = 'La date est requise'
  }

  if (!values.start_time) {
    errors.start_time = 'L\'heure de début est requise'
  }

  if (!values.end_time) {
    errors.end_time = 'L\'heure de fin est requise'
  }

  if (values.start_time && values.end_time && values.start_time >= values.end_time) {
    errors.end_time = 'L\'heure de fin doit être après l\'heure de début'
  }

  if (values.capacity <= 0) {
    errors.capacity = 'La capacité doit être supérieure à 0'
  }

  // Vérifier que la date n'est pas dans le passé
  if (values.date) {
    const selectedDate = new Date(values.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      errors.date = 'La date ne peut pas être dans le passé'
    }
  }

  return errors
}

/**
 * Formulaire de création/édition de créneau
 * Utilise FormField et useForm pour une gestion cohérente
 */
export default function SlotForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Enregistrer',
  isLoading = false,
}: SlotFormProps) {
  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useForm<SlotFormValues>({
    initialValues: { ...defaultValues, ...initialValues },
    validate: validateSlot,
    onSubmit,
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Date du créneau"
        name="date"
        type="date"
        value={values.date}
        onChange={(val) => handleChange('date', val)}
        error={errors.date}
        required
        helpText="Sélectionnez la date du créneau de retrait/livraison"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Heure de début"
          name="start_time"
          type="time"
          value={values.start_time}
          onChange={(val) => handleChange('start_time', val)}
          error={errors.start_time}
          required
          helpText="Format 24h (ex: 14:00)"
        />

        <FormField
          label="Heure de fin"
          name="end_time"
          type="time"
          value={values.end_time}
          onChange={(val) => handleChange('end_time', val)}
          error={errors.end_time}
          required
          helpText="Format 24h (ex: 17:00)"
        />
      </div>

      <FormField
        label="Capacité maximale"
        name="capacity"
        type="number"
        value={values.capacity}
        onChange={(val) => handleChange('capacity', val)}
        error={errors.capacity}
        placeholder="20"
        min={1}
        required
        helpText="Nombre maximum de commandes acceptées pour ce créneau"
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-800">
          <strong>Aperçu :</strong>{' '}
          {values.date && values.start_time && values.end_time ? (
            <>
              Le {new Date(values.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}{' '}
              de {values.start_time} à {values.end_time} ({values.capacity} places)
            </>
          ) : (
            'Remplissez les champs pour voir l\'aperçu'
          )}
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            Annuler
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || isLoading}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {isSubmitting || isLoading ? 'Enregistrement...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
