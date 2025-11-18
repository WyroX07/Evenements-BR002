'use client'

import { useForm, FormErrors } from '@/hooks/useForm'
import FormField from './FormField'
import Button from '@/components/ui/Button'

export interface EventFormValues {
  name: string
  slug: string
  description: string
  start_date: string
  end_date: string
  section_id: string
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | ''
  hero_image_url: string
  hero_title: string
  hero_subtitle: string
  hero_show_stats: boolean
  hero_cta_text: string
}

export interface EventFormProps {
  initialValues?: Partial<EventFormValues>
  onSubmit: (values: EventFormValues) => Promise<void>
  onCancel?: () => void
  sections: Array<{ id: string; name: string }>
  submitText?: string
  isSubmitting?: boolean
}

const defaultValues: EventFormValues = {
  name: '',
  slug: '',
  description: '',
  start_date: '',
  end_date: '',
  section_id: '',
  status: '',
  hero_image_url: '',
  hero_title: '',
  hero_subtitle: '',
  hero_show_stats: true,
  hero_cta_text: 'Commander maintenant',
}

const validateEvent = (values: EventFormValues): FormErrors => {
  const errors: FormErrors = {}

  if (!values.name || values.name.trim().length < 3) {
    errors.name = 'Le nom doit contenir au moins 3 caractères'
  }

  if (!values.slug || values.slug.trim().length < 3) {
    errors.slug = 'Le slug doit contenir au moins 3 caractères'
  } else if (!/^[a-z0-9-]+$/.test(values.slug)) {
    errors.slug = 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'
  }

  if (!values.description || values.description.trim().length < 10) {
    errors.description = 'La description doit contenir au moins 10 caractères'
  }

  if (!values.start_date) {
    errors.start_date = 'La date de début est requise'
  }

  if (!values.end_date) {
    errors.end_date = 'La date de fin est requise'
  }

  if (values.start_date && values.end_date && values.start_date > values.end_date) {
    errors.end_date = 'La date de fin doit être après la date de début'
  }

  if (!values.section_id) {
    errors.section_id = 'La section est requise'
  }

  if (!values.status) {
    errors.status = 'Le statut est requis'
  }

  if (!values.hero_title || values.hero_title.trim().length < 3) {
    errors.hero_title = 'Le titre hero doit contenir au moins 3 caractères'
  }

  if (!values.hero_cta_text || values.hero_cta_text.trim().length < 3) {
    errors.hero_cta_text = 'Le texte du bouton doit contenir au moins 3 caractères'
  }

  return errors
}

export default function EventForm({
  initialValues = {},
  onSubmit,
  onCancel,
  sections,
  submitText = 'Enregistrer',
  isSubmitting = false,
}: EventFormProps) {
  const form = useForm({
    initialValues: { ...defaultValues, ...initialValues },
    validate: validateEvent,
    onSubmit,
  })

  const { values, errors, touched, isSubmitting: formSubmitting, handleChange, handleBlur, handleSubmit } = form

  const submitting = isSubmitting || formSubmitting

  // Auto-generate slug from name
  const handleNameChange = (value: string | number) => {
    handleChange('name', value)
    if (!initialValues.slug) {
      const slug = String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      handleChange('slug', slug)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Nom de l'événement"
          name="name"
          type="text"
          value={values.name}
          onChange={handleNameChange}
          onBlur={() => handleBlur('name')}
          error={touched.name ? errors.name : undefined}
          required
        />

        <FormField
          label="Slug (URL)"
          name="slug"
          type="text"
          value={values.slug}
          onChange={(value) => handleChange('slug', value)}
          onBlur={() => handleBlur('slug')}
          error={touched.slug ? errors.slug : undefined}
          required
          help="Lettres minuscules, chiffres et tirets uniquement"
        />
      </div>

      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={values.description}
        onChange={(value) => handleChange('description', value)}
        onBlur={() => handleBlur('description')}
        error={touched.description ? errors.description : undefined}
        required
        rows={4}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Date de début"
          name="start_date"
          type="date"
          value={values.start_date}
          onChange={(value) => handleChange('start_date', value)}
          onBlur={() => handleBlur('start_date')}
          error={touched.start_date ? errors.start_date : undefined}
          required
        />

        <FormField
          label="Date de fin"
          name="end_date"
          type="date"
          value={values.end_date}
          onChange={(value) => handleChange('end_date', value)}
          onBlur={() => handleBlur('end_date')}
          error={touched.end_date ? errors.end_date : undefined}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Section"
          name="section_id"
          type="select"
          value={values.section_id}
          onChange={(value) => handleChange('section_id', value)}
          onBlur={() => handleBlur('section_id')}
          error={touched.section_id ? errors.section_id : undefined}
          required
          options={[
            { value: '', label: 'Sélectionner une section' },
            ...sections.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />

        <FormField
          label="Statut"
          name="status"
          type="select"
          value={values.status}
          onChange={(value) => handleChange('status', value)}
          onBlur={() => handleBlur('status')}
          error={touched.status ? errors.status : undefined}
          required
          options={[
            { value: '', label: 'Sélectionner un statut' },
            { value: 'DRAFT', label: 'Brouillon' },
            { value: 'ACTIVE', label: 'Actif' },
            { value: 'ARCHIVED', label: 'Archivé' },
          ]}
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Configuration Hero</h3>

        <div className="space-y-4">
          <FormField
            label="Image Hero (URL)"
            name="hero_image_url"
            type="text"
            value={values.hero_image_url}
            onChange={(value) => handleChange('hero_image_url', value)}
            onBlur={() => handleBlur('hero_image_url')}
            error={touched.hero_image_url ? errors.hero_image_url : undefined}
            placeholder="https://..."
          />

          <FormField
            label="Titre Hero"
            name="hero_title"
            type="text"
            value={values.hero_title}
            onChange={(value) => handleChange('hero_title', value)}
            onBlur={() => handleBlur('hero_title')}
            error={touched.hero_title ? errors.hero_title : undefined}
            required
          />

          <FormField
            label="Sous-titre Hero"
            name="hero_subtitle"
            type="textarea"
            value={values.hero_subtitle}
            onChange={(value) => handleChange('hero_subtitle', value)}
            onBlur={() => handleBlur('hero_subtitle')}
            error={touched.hero_subtitle ? errors.hero_subtitle : undefined}
            rows={2}
          />

          <FormField
            label="Texte du bouton CTA"
            name="hero_cta_text"
            type="text"
            value={values.hero_cta_text}
            onChange={(value) => handleChange('hero_cta_text', value)}
            onBlur={() => handleBlur('hero_cta_text')}
            error={touched.hero_cta_text ? errors.hero_cta_text : undefined}
            required
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hero_show_stats"
              checked={values.hero_show_stats}
              onChange={(e) => handleChange('hero_show_stats', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="hero_show_stats" className="text-sm font-medium text-gray-700">
              Afficher les statistiques dans le hero
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Enregistrement...' : submitText}
        </Button>
      </div>
    </form>
  )
}
