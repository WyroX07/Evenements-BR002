'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const promoCodeSchema = z.object({
  code: z.string().min(2, 'Code trop court').max(20, 'Code trop long').regex(/^[A-Z0-9]+$/, 'Uniquement lettres majuscules et chiffres'),
  discountEuros: z.number().min(0.01, 'Minimum 0.01€').max(1000, 'Maximum 1000€'),
  description: z.string().max(200, 'Description trop longue').optional(),
  isActive: z.boolean(),
})

export type PromoCodeFormValues = z.infer<typeof promoCodeSchema>

interface PromoCodeFormProps {
  initialValues?: Partial<PromoCodeFormValues>
  onSubmit: (values: PromoCodeFormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function PromoCodeForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: PromoCodeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PromoCodeFormValues>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      code: initialValues?.code || '',
      discountEuros: initialValues?.discountEuros || 0,
      description: initialValues?.description || '',
      isActive: initialValues?.isActive !== undefined ? initialValues.isActive : true,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Code promo *
        </label>
        <Input
          {...register('code')}
          placeholder="SCOUTS"
          disabled={isLoading || !!initialValues?.code}
          className="uppercase"
        />
        {errors.code && (
          <p className="text-sm text-red-600 mt-1">{errors.code.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Lettres majuscules et chiffres uniquement
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Réduction (€) *
        </label>
        <Input
          type="number"
          step="0.01"
          {...register('discountEuros', { valueAsNumber: true })}
          placeholder="2.00"
          disabled={isLoading}
        />
        {errors.discountEuros && (
          <p className="text-sm text-red-600 mt-1">{errors.discountEuros.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optionnelle)
        </label>
        <Input
          {...register('description')}
          placeholder="Réduction pour les scouts"
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register('isActive')}
          className="w-4 h-4 text-amber-600 rounded"
          disabled={isLoading}
        />
        <label className="text-sm font-medium text-gray-700">
          Code actif
        </label>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : initialValues?.code ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
