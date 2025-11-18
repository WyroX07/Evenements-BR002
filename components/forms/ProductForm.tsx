'use client'

import React, { useState } from 'react'
import { useForm, FormErrors } from '@/hooks/useForm'
import FormField from './FormField'
import Button from '@/components/ui/Button'

export interface ProductFormValues {
  name: string
  description: string
  price_cents: number
  product_type: 'ITEM' | 'MENU' | 'TICKET' | ''
  stock: number | null
  is_active: boolean
  sort_order: number
  image_url: string
  allergens: string[]
  is_vegetarian: boolean
  is_vegan: boolean
  // Wine-specific fields
  is_wine: boolean
  vintage: string
  color: string
  aromas: string
  balance: string
  food_pairings: string
  conservation: string
  grape_variety: string
  wine_type: string
  appellation: string
  special_mentions: string[]
  residual_sugar_gl: number | null
  limited_stock: boolean
  highlight_badge: string
  producer: string
  origin: string
}

export interface ProductFormProps {
  initialValues?: Partial<ProductFormValues>
  onSubmit: (values: ProductFormValues) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  isLoading?: boolean
}

const defaultValues: ProductFormValues = {
  name: '',
  description: '',
  price_cents: 0,
  product_type: '',
  stock: null,
  is_active: true,
  sort_order: 0,
  image_url: '',
  allergens: [],
  is_vegetarian: false,
  is_vegan: false,
  // Wine defaults
  is_wine: false,
  vintage: '',
  color: '',
  aromas: '',
  balance: '',
  food_pairings: '',
  conservation: '',
  grape_variety: '',
  wine_type: '',
  appellation: '',
  special_mentions: [],
  residual_sugar_gl: null,
  limited_stock: false,
  highlight_badge: '',
  producer: '',
  origin: '',
}

const validateProduct = (values: ProductFormValues): FormErrors => {
  const errors: FormErrors = {}

  if (!values.name || values.name.trim() === '') {
    errors.name = 'Le nom est requis'
  }

  if (!values.product_type) {
    errors.product_type = 'Le type de produit est requis'
  }

  if (values.price_cents <= 0) {
    errors.price_cents = 'Le prix doit être supérieur à 0'
  }

  if (values.stock !== null && values.stock < 0) {
    errors.stock = 'Le stock ne peut pas être négatif'
  }

  if (values.sort_order < 0) {
    errors.sort_order = 'L\'ordre ne peut pas être négatif'
  }

  return errors
}

/**
 * Formulaire de création/édition de produit
 * Utilise FormField et useForm pour une gestion cohérente
 */
export default function ProductForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Enregistrer',
  isLoading = false,
}: ProductFormProps) {
  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useForm<ProductFormValues>({
    initialValues: { ...defaultValues, ...initialValues },
    validate: validateProduct,
    onSubmit,
  })

  const productTypeOptions = [
    { value: 'ITEM', label: 'Article' },
    { value: 'MENU', label: 'Menu' },
    { value: 'TICKET', label: 'Ticket' },
  ]

  const availableAllergens = [
    { value: 'gluten', label: 'Gluten' },
    { value: 'lactose', label: 'Lactose' },
    { value: 'oeufs', label: 'Œufs' },
    { value: 'poisson', label: 'Poisson' },
    { value: 'crustaces', label: 'Crustacés' },
    { value: 'fruits_a_coque', label: 'Fruits à coque' },
    { value: 'arachides', label: 'Arachides' },
    { value: 'soja', label: 'Soja' },
    { value: 'celeri', label: 'Céleri' },
    { value: 'moutarde', label: 'Moutarde' },
    { value: 'sesame', label: 'Sésame' },
    { value: 'sulfites', label: 'Sulfites' },
    { value: 'lupin', label: 'Lupin' },
    { value: 'mollusques', label: 'Mollusques' },
  ]

  const toggleAllergen = (allergen: string) => {
    const current = values.allergens || []
    if (current.includes(allergen)) {
      handleChange('allergens', current.filter(a => a !== allergen))
    } else {
      handleChange('allergens', [...current, allergen])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Nom du produit"
        name="name"
        type="text"
        value={values.name}
        onChange={(val) => handleChange('name', val)}
        error={errors.name}
        placeholder="Ex: Crémant d'Alsace Brut"
        required
      />

      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={values.description}
        onChange={(val) => handleChange('description', val)}
        error={errors.description}
        placeholder="Décrivez le produit..."
        rows={4}
        helpText="Une description détaillée aide les clients à mieux comprendre le produit"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Type de produit"
          name="product_type"
          type="select"
          value={values.product_type}
          onChange={(val) => handleChange('product_type', val)}
          error={errors.product_type}
          options={productTypeOptions}
          required
        />

        <FormField
          label="Prix (en centimes)"
          name="price_cents"
          type="number"
          value={values.price_cents}
          onChange={(val) => handleChange('price_cents', val)}
          error={errors.price_cents}
          placeholder="1400"
          min={0}
          step={1}
          required
          helpText="Prix en centimes (ex: 1400 = 14,00 €)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Stock disponible"
          name="stock"
          type="number"
          value={values.stock ?? ''}
          onChange={(val) => handleChange('stock', val === '' ? null : val)}
          error={errors.stock}
          placeholder="Laisser vide pour illimité"
          min={0}
          helpText="Laisser vide pour un stock illimité"
        />

        <FormField
          label="Ordre d'affichage"
          name="sort_order"
          type="number"
          value={values.sort_order}
          onChange={(val) => handleChange('sort_order', val)}
          error={errors.sort_order}
          placeholder="0"
          min={0}
          helpText="Les produits sont triés par ordre croissant"
        />
      </div>

      <FormField
        label="URL de l'image"
        name="image_url"
        type="text"
        value={values.image_url}
        onChange={(val) => handleChange('image_url', val)}
        error={errors.image_url}
        placeholder="https://example.com/image.jpg"
        helpText="Optionnel : URL d'une image du produit"
      />

      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="is_active"
          checked={values.is_active}
          onChange={(e) => handleChange('is_active', e.target.checked)}
          className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
        />
        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
          Produit actif (visible par les clients)
        </label>
      </div>

      {/* Wine product toggle */}
      <div className="flex items-center gap-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <input
          type="checkbox"
          id="is_wine"
          checked={values.is_wine}
          onChange={(e) => handleChange('is_wine', e.target.checked)}
          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
        />
        <label htmlFor="is_wine" className="text-sm font-medium text-gray-700">
          🍷 Ce produit est un vin, crémant ou champagne (afficher les détails œnologiques)
        </label>
      </div>

      {/* Wine-specific details - only shown when is_wine is checked */}
      {values.is_wine && (
        <div className="space-y-4 p-6 bg-purple-50 rounded-lg border-2 border-purple-300">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">Détails œnologiques</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Producteur"
              name="producer"
              type="text"
              value={values.producer}
              onChange={(val) => handleChange('producer', val)}
              placeholder="Ex: Lissner, Veuve Doussot"
              helpText="Nom du producteur"
            />

            <FormField
              label="Origine"
              name="origin"
              type="text"
              value={values.origin}
              onChange={(val) => handleChange('origin', val)}
              placeholder="Ex: Alsace, Champagne"
              helpText="Région d'origine"
            />

            <FormField
              label="Cépage"
              name="grape_variety"
              type="text"
              value={values.grape_variety}
              onChange={(val) => handleChange('grape_variety', val)}
              placeholder="Ex: Pinot Blanc, Chardonnay, Riesling"
            />

            <FormField
              label="Millésime"
              name="vintage"
              type="text"
              value={values.vintage}
              onChange={(val) => handleChange('vintage', val)}
              placeholder="Ex: 2018z, 2013/2014"
              helpText="z = non filtré"
            />

            <FormField
              label="Type de vin"
              name="wine_type"
              type="text"
              value={values.wine_type}
              onChange={(val) => handleChange('wine_type', val)}
              placeholder="Ex: sec, brut nature, légèrement moelleux"
            />

            <FormField
              label="Couleur"
              name="color"
              type="text"
              value={values.color}
              onChange={(val) => handleChange('color', val)}
              placeholder="Ex: jaune clair, rose, rouge clair"
            />

            <FormField
              label="Appellation"
              name="appellation"
              type="text"
              value={values.appellation}
              onChange={(val) => handleChange('appellation', val)}
              placeholder="Ex: Grand Cru Altenberg, AOC Alsace"
            />

            <FormField
              label="Conservation"
              name="conservation"
              type="text"
              value={values.conservation}
              onChange={(val) => handleChange('conservation', val)}
              placeholder="Ex: 5-7 ans, + 10 ans"
            />

            <FormField
              label="Badge de mise en avant"
              name="highlight_badge"
              type="text"
              value={values.highlight_badge}
              onChange={(val) => handleChange('highlight_badge', val)}
              placeholder="Ex: Édition limitée, Exclusivité"
              helpText="Optionnel - badge marketing"
            />

            <FormField
              label="Sucres résiduels (g/l)"
              name="residual_sugar_gl"
              type="number"
              value={values.residual_sugar_gl?.toString() || ''}
              onChange={(val) => handleChange('residual_sugar_gl', val ? parseInt(val) : null)}
              placeholder="Ex: 0, 7, 65, 160"
              helpText="Optionnel - pour vins moelleux/liquoreux"
            />
          </div>

          <FormField
            label="Arômes et parfums"
            name="aromas"
            type="textarea"
            value={values.aromas}
            onChange={(val) => handleChange('aromas', val)}
            placeholder="Ex: épicé, intense, fruité, salin..."
            rows={2}
          />

          <FormField
            label="Équilibre en bouche"
            name="balance"
            type="textarea"
            value={values.balance}
            onChange={(val) => handleChange('balance', val)}
            placeholder="Ex: frais et puissant, léger sans sucres résiduels..."
            rows={2}
          />

          <FormField
            label="Accords culinaires"
            name="food_pairings"
            type="textarea"
            value={values.food_pairings}
            onChange={(val) => handleChange('food_pairings', val)}
            placeholder="Ex: apéritif, viande, poissons, plats goûteux..."
            rows={2}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="limited_stock"
              checked={values.limited_stock}
              onChange={(e) => handleChange('limited_stock', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="limited_stock" className="text-sm font-medium text-gray-700">
              Stock limité (affichera "Édition limitée" ou urgence)
            </label>
          </div>
        </div>
      )}

      {/* Dietary preferences */}
      <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Régimes alimentaires</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_vegetarian"
              checked={values.is_vegetarian}
              onChange={(e) => handleChange('is_vegetarian', e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="is_vegetarian" className="text-sm text-gray-700">
              Végétarien
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_vegan"
              checked={values.is_vegan}
              onChange={(e) => handleChange('is_vegan', e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="is_vegan" className="text-sm text-gray-700">
              Végétalien (Vegan)
            </label>
          </div>
        </div>
      </div>

      {/* Allergens */}
      <div className="space-y-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Allergènes présents</h3>
        <p className="text-xs text-gray-600 mb-3">
          Sélectionnez tous les allergènes que ce produit contient
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {availableAllergens.map((allergen) => (
            <div key={allergen.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`allergen_${allergen.value}`}
                checked={(values.allergens || []).includes(allergen.value)}
                onChange={() => toggleAllergen(allergen.value)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor={`allergen_${allergen.value}`} className="text-sm text-gray-700">
                {allergen.label}
              </label>
            </div>
          ))}
        </div>
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
