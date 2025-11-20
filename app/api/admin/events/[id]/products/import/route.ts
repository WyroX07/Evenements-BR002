import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

/**
 * Vérifie l'authentification admin
 */
async function checkAdminAuth() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')

  if (!adminSession || adminSession.value !== 'authenticated') {
    return false
  }
  return true
}

/**
 * Interface pour un produit à importer
 */
interface ProductImport {
  name: string
  description: string
  price_cents: number
  product_type: 'ITEM' | 'MENU' | 'TICKET'
  stock: number | null
  is_active: boolean
  sort_order: number
  allergens: string[]
  is_vegetarian: boolean
  is_vegan: boolean
}

/**
 * Interface pour le résultat de validation
 */
interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  product: ProductImport | null
}

/**
 * Normalise les noms de colonnes du CSV
 * Accepte à la fois les noms en français et en anglais
 */
function normalizeRow(row: any): any {
  const normalized: any = {}

  // Mapping des noms de colonnes
  const columnMapping: Record<string, string> = {
    // Noms anglais (clés de sortie)
    'name': 'name',
    'description': 'description',
    'price_cents': 'price_cents',
    'product_type': 'product_type',
    'stock': 'stock',
    'is_active': 'is_active',
    'sort_order': 'sort_order',
    'allergens': 'allergens',
    'is_vegetarian': 'is_vegetarian',
    'is_vegan': 'is_vegan',

    // Noms français (variantes acceptées)
    'nom du produit': 'name',
    'nom': 'name',
    'prix (en centimes)': 'price_cents',
    'prix': 'price_cents',
    'type (item/menu/ticket)': 'product_type',
    'type': 'product_type',
    'stock disponible': 'stock',
    'actif (true/false)': 'is_active',
    'actif': 'is_active',
    'ordre d\'affichage': 'sort_order',
    'ordre': 'sort_order',
    'allergènes (séparés par virgule)': 'allergens',
    'allergènes': 'allergens',
    'allergenes': 'allergens',
    'végétarien (true/false)': 'is_vegetarian',
    'végétarien': 'is_vegetarian',
    'vegetarien': 'is_vegetarian',
    'végétalien/vegan (true/false)': 'is_vegan',
    'végétalien': 'is_vegan',
    'vegan': 'is_vegan',

    // Nouvelles variantes simplifiées (template actuel)
    'prix en centimes': 'price_cents',
  }

  // Normaliser chaque clé
  Object.keys(row).forEach(key => {
    const normalizedKey = columnMapping[key.toLowerCase().trim()] || key
    normalized[normalizedKey] = row[key]
  })

  return normalized
}

/**
 * Valide une ligne CSV parsée
 */
function validateProductRow(row: any, lineNumber: number): ValidationResult {
  // Normaliser les noms de colonnes
  const normalizedRow = normalizeRow(row)
  const errors: string[] = []
  const warnings: string[] = []

  // Validation du nom
  if (!normalizedRow.name || typeof normalizedRow.name !== 'string' || normalizedRow.name.trim() === '') {
    errors.push(`Ligne ${lineNumber}: Le nom du produit est requis`)
  }

  // Validation du type de produit
  const validTypes = ['ITEM', 'MENU', 'TICKET']
  if (!normalizedRow.product_type || !validTypes.includes(normalizedRow.product_type.toUpperCase())) {
    errors.push(`Ligne ${lineNumber}: Type de produit invalide (ITEM, MENU ou TICKET attendu)`)
  }

  // Validation du prix
  const priceCents = parseInt(normalizedRow.price_cents, 10)
  if (isNaN(priceCents) || priceCents <= 0) {
    errors.push(`Ligne ${lineNumber}: Prix invalide (doit être un nombre positif en centimes)`)
  }

  // Validation du stock (optionnel)
  let stock: number | null = null
  if (normalizedRow.stock !== undefined && normalizedRow.stock !== null && normalizedRow.stock !== '') {
    const stockValue = parseInt(normalizedRow.stock, 10)
    if (isNaN(stockValue) || stockValue < 0) {
      errors.push(`Ligne ${lineNumber}: Stock invalide (doit être un nombre positif ou vide)`)
    } else {
      stock = stockValue
    }
  }

  // Validation de l'ordre de tri
  let sortOrder = 0
  if (normalizedRow.sort_order !== undefined && normalizedRow.sort_order !== null && normalizedRow.sort_order !== '') {
    const sortOrderValue = parseInt(normalizedRow.sort_order, 10)
    if (isNaN(sortOrderValue) || sortOrderValue < 0) {
      warnings.push(`Ligne ${lineNumber}: Ordre de tri invalide, 0 sera utilisé par défaut`)
    } else {
      sortOrder = sortOrderValue
    }
  }

  // Parse des allergènes (format: "gluten,lactose,soja")
  let allergens: string[] = []
  if (normalizedRow.allergens && typeof normalizedRow.allergens === 'string') {
    allergens = normalizedRow.allergens.split(',').map((a: string) => a.trim()).filter((a: string) => a.length > 0)
  }

  // Parse des booleans
  const parseBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim()
      return lower === 'true' || lower === '1' || lower === 'oui' || lower === 'yes'
    }
    return false
  }

  const isActive = normalizedRow.is_active !== undefined ? parseBoolean(normalizedRow.is_active) : true
  const isVegetarian = parseBoolean(normalizedRow.is_vegetarian)
  const isVegan = parseBoolean(normalizedRow.is_vegan)

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      warnings,
      product: null,
    }
  }

  return {
    valid: true,
    errors: [],
    warnings,
    product: {
      name: normalizedRow.name.trim(),
      description: normalizedRow.description?.trim() || '',
      price_cents: priceCents,
      product_type: normalizedRow.product_type.toUpperCase() as 'ITEM' | 'MENU' | 'TICKET',
      stock,
      is_active: isActive,
      sort_order: sortOrder,
      allergens,
      is_vegetarian: isVegetarian,
      is_vegan: isVegan,
    },
  }
}

/**
 * POST /api/admin/events/[id]/products/import
 * Importe des produits depuis un CSV parsé
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdminAuth()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: eventId } = await params
    const body = await request.json()
    const { products: csvProducts, preview = false } = body

    if (!csvProducts || !Array.isArray(csvProducts)) {
      return NextResponse.json(
        { error: 'Données CSV invalides' },
        { status: 400 }
      )
    }

    // Valider tous les produits
    const validationResults: ValidationResult[] = csvProducts.map((row, index) => {
      return validateProductRow(row, index + 2) // +2 car ligne 1 = header, index 0 = ligne 2
    })

    const validProducts = validationResults
      .filter(r => r.valid && r.product !== null)
      .map(r => r.product!)

    const allErrors = validationResults.flatMap(r => r.errors)
    const allWarnings = validationResults.flatMap(r => r.warnings)

    // Si mode preview, retourner seulement la validation
    if (preview) {
      return NextResponse.json({
        preview: true,
        totalRows: csvProducts.length,
        validProducts: validProducts.length,
        invalidProducts: csvProducts.length - validProducts.length,
        errors: allErrors,
        warnings: allWarnings,
        products: validProducts,
      })
    }

    // Si des erreurs, ne pas continuer
    if (allErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation échouée',
          errors: allErrors,
          warnings: allWarnings,
        },
        { status: 400 }
      )
    }

    // Vérifier que l'événement existe
    const supabase = createServerClient() as any
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    // Insérer les produits
    const productsToInsert = validProducts.map(product => ({
      event_id: eventId,
      ...product,
    }))

    const { data: insertedProducts, error: insertError } = await supabase
      .from('products')
      .insert(productsToInsert)
      .select()

    if (insertError) {
      console.error('Error inserting products:', insertError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'insertion des produits' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      imported: insertedProducts.length,
      warnings: allWarnings,
      products: insertedProducts,
    })
  } catch (error) {
    console.error('Error in POST /api/admin/events/[id]/products/import:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
