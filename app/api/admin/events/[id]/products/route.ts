import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

/**
 * Vérifie si l'utilisateur est authentifié comme admin
 */
async function checkAdminAuth() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')

  if (!adminSession || adminSession.value !== 'authenticated') {
    return false
  }
  return true
}

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price_cents: z.number().int().min(0),
  product_type: z.enum(['ITEM', 'MENU', 'TICKET']),
  stock: z.number().int().min(0).nullable().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
  image_url: z.string().url().or(z.literal('')).nullable().optional(),
  allergens: z.array(z.string()).default([]),
  is_vegetarian: z.boolean().default(false),
  is_vegan: z.boolean().default(false),

  // Champs spécifiques aux vins/crémants/champagnes
  is_wine: z.boolean().default(false),
  vintage: z.string().optional(),
  color: z.string().optional(),
  aromas: z.string().optional(),
  balance: z.string().optional(),
  food_pairings: z.string().optional(),
  conservation: z.string().optional(),
  grape_variety: z.string().optional(),
  wine_type: z.string().optional(),
  appellation: z.string().optional(),
  special_mentions: z.array(z.string()).default([]),
  residual_sugar_gl: z.number().int().nullable().optional(),
  limited_stock: z.boolean().default(false),
  highlight_badge: z.string().optional(),
  producer: z.string().optional(),
  origin: z.string().optional(),
})

const updateProductSchema = productSchema.partial()

/**
 * GET /api/admin/events/[id]/products
 * Liste tous les produits d'un événement
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: eventId } = await params
    const supabase = createServerClient() as any

    // Vérifier que l'événement existe
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    // Récupérer tous les produits
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true })

    if (productsError) {
      console.error('Erreur récupération produits:', productsError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des produits' },
        { status: 500 }
      )
    }

    return NextResponse.json({ products: products || [] })
  } catch (error) {
    console.error('Erreur GET admin products:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST /api/admin/events/[id]/products
 * Crée un nouveau produit pour un événement
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: eventId } = await params
    const body = await request.json()
    const validatedData = productSchema.parse(body)

    const supabase = createServerClient() as any

    // Vérifier que l'événement existe
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    // Créer le produit
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        event_id: eventId,
        name: validatedData.name,
        description: validatedData.description,
        price_cents: validatedData.price_cents,
        product_type: validatedData.product_type,
        stock: validatedData.stock,
        is_active: validatedData.is_active,
        sort_order: validatedData.sort_order,
        image_url: validatedData.image_url,
        allergens: validatedData.allergens,
        is_vegetarian: validatedData.is_vegetarian,
        is_vegan: validatedData.is_vegan,
        // Champs vins
        is_wine: validatedData.is_wine,
        vintage: validatedData.vintage,
        color: validatedData.color,
        aromas: validatedData.aromas,
        balance: validatedData.balance,
        food_pairings: validatedData.food_pairings,
        conservation: validatedData.conservation,
        grape_variety: validatedData.grape_variety,
        wine_type: validatedData.wine_type,
        appellation: validatedData.appellation,
        special_mentions: validatedData.special_mentions,
        residual_sugar_gl: validatedData.residual_sugar_gl,
        limited_stock: validatedData.limited_stock,
        highlight_badge: validatedData.highlight_badge,
        producer: validatedData.producer,
        origin: validatedData.origin,
      })
      .select()
      .single()

    if (productError) {
      console.error('Erreur création produit:', productError)
      return NextResponse.json(
        { error: 'Erreur lors de la création du produit' },
        { status: 500 }
      )
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      event_id: eventId,
      action: 'PRODUCT_CREATED',
      meta: {
        product_name: product.name,
        event_name: event.name,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur POST admin product:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/events/[id]/products/[productId]
 * Met à jour un produit
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'ID du produit manquant' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    const supabase = createServerClient() as any

    // Vérifier que le produit existe et appartient à cet événement
    const { data: existingProduct, error: existingError } = await supabase
      .from('products')
      .select('*, event:events(name)')
      .eq('id', productId)
      .eq('event_id', resolvedParams.id)
      .single()

    if (existingError || !existingProduct) {
      return NextResponse.json(
        { error: 'Produit introuvable' },
        { status: 404 }
      )
    }

    // Mettre à jour le produit
    const { data: product, error: updateError } = await supabase
      .from('products')
      .update(validatedData)
      .eq('id', productId)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur mise à jour produit:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du produit' },
        { status: 500 }
      )
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      event_id: resolvedParams.id,
      action: 'PRODUCT_UPDATED',
      meta: {
        product_name: product.name,
        updated_fields: Object.keys(validatedData),
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur PATCH admin product:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/events/[id]/products/[productId]
 * Supprime un produit (seulement si non commandé)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'ID du produit manquant' },
        { status: 400 }
      )
    }

    const supabase = createServerClient() as any

    // Vérifier que le produit existe
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('name')
      .eq('id', productId)
      .eq('event_id', resolvedParams.id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Produit introuvable' },
        { status: 404 }
      )
    }

    // Vérifier qu'il n'est pas dans des commandes
    const { count: ordersCount } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)

    if ((ordersCount || 0) > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un produit commandé. Désactivez-le à la place.' },
        { status: 400 }
      )
    }

    // Supprimer le produit
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (deleteError) {
      console.error('Erreur suppression produit:', deleteError)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du produit' },
        { status: 500 }
      )
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      event_id: resolvedParams.id,
      action: 'PRODUCT_DELETED',
      meta: { product_name: product.name },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur DELETE admin product:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
