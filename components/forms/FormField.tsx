import React from 'react'

export interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'date' | 'time'
  value: string | number
  onChange: (value: string | number) => void
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  options?: Array<{ value: string | number; label: string }>
  min?: number
  max?: number
  step?: number
  rows?: number
  helpText?: string
}

/**
 * Composant de champ de formulaire réutilisable
 * Gère automatiquement label, input, erreur et états
 */
export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  readonly = false,
  options,
  min,
  max,
  step,
  rows = 3,
  helpText,
}: FormFieldProps) {
  const inputId = `field-${name}`
  const hasError = !!error

  const baseInputClasses = `
    w-full px-3 py-2 border rounded-lg
    focus:outline-none focus:ring-2 transition-colors
    ${hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:border-amber-500 focus:ring-amber-200'
    }
    ${disabled || readonly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
  `.trim()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.value

    if (type === 'number') {
      onChange(val === '' ? '' : parseFloat(val))
    } else {
      onChange(val)
    }
  }

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            rows={rows}
            className={`${baseInputClasses} resize-y`}
          />
        )

      case 'select':
        return (
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            className={baseInputClasses}
          >
            <option value="">Sélectionner...</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )

      case 'number':
        return (
          <input
            id={inputId}
            type="number"
            name={name}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            min={min}
            max={max}
            step={step}
            className={baseInputClasses}
          />
        )

      default:
        return (
          <input
            id={inputId}
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            className={baseInputClasses}
          />
        )
    }
  }

  return (
    <div className="mb-4">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {renderInput()}

      {helpText && !hasError && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}

      {hasError && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <span className="font-medium">⚠</span>
          {error}
        </p>
      )}
    </div>
  )
}
