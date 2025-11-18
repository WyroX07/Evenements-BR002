import { useState } from 'react'

export interface FormErrors {
  [key: string]: string
}

export interface UseFormOptions<T> {
  initialValues: T
  validate?: (values: T) => FormErrors
  onSubmit: (values: T) => Promise<void>
}

export interface UseFormReturn<T> {
  values: T
  errors: FormErrors
  isSubmitting: boolean
  touched: Record<string, boolean>
  handleChange: (name: keyof T, value: any) => void
  handleBlur: (name: keyof T) => void
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  setFieldValue: (name: keyof T, value: any) => void
  setFieldError: (name: keyof T, error: string) => void
  resetForm: () => void
}

/**
 * Hook personnalisé pour gérer l'état et la validation d'un formulaire
 *
 * @example
 * ```tsx
 * const { values, errors, handleChange, handleSubmit } = useForm({
 *   initialValues: { name: '', price: 0 },
 *   validate: (values) => {
 *     const errors: FormErrors = {}
 *     if (!values.name) errors.name = 'Le nom est requis'
 *     if (values.price <= 0) errors.price = 'Le prix doit être positif'
 *     return errors
 *   },
 *   onSubmit: async (values) => {
 *     await saveProduct(values)
 *   }
 * })
 * ```
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (name: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Effacer l'erreur du champ lors de la modification
    if (errors[name as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name as string]
        return newErrors
      })
    }
  }

  const handleBlur = (name: keyof T) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    // Valider le champ au blur
    if (validate) {
      const validationErrors = validate(values)
      if (validationErrors[name as string]) {
        setErrors((prev) => ({
          ...prev,
          [name as string]: validationErrors[name as string],
        }))
      }
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    // Marquer tous les champs comme touchés
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as Record<string, boolean>)
    setTouched(allTouched)

    // Valider tous les champs
    if (validate) {
      const validationErrors = validate(values)
      setErrors(validationErrors)

      // Si des erreurs existent, ne pas soumettre
      if (Object.keys(validationErrors).length > 0) {
        return
      }
    }

    // Soumettre le formulaire
    try {
      setIsSubmitting(true)
      await onSubmit(values)
      // resetForm() peut être appelé après succès si nécessaire
    } catch (error) {
      console.error('Erreur de soumission:', error)
      // L'erreur peut être gérée par le composant parent
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const setFieldValue = (name: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const setFieldError = (name: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [name as string]: error,
    }))
  }

  const resetForm = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }

  return {
    values,
    errors,
    isSubmitting,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
  }
}
