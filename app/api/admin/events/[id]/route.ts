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

const updateEventSchema = z.object({
  slug: z.string().min(1).optional(),
  section_id: z.string().uuid().optional(),
  event_type: z.enum(['PRODUCT_SALE', 'MEAL', 'RAFFLE']).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED']).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  hero_config: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    banner_url: z.string().url().nullable().optional(),
    show_deadline: z.boolean().optional(),
    show_stats: z.boolean().optional(),
    features: z.array(z.string()).optional(),
    cta_text: z.string().optional(),
  }).optional(),
  config: z.object({
    delivery_enabled: z.boolean().optional(),
    delivery_min_bottles: z.number().int().min(0).optional(),
    delivery_fee_cents: z.number().int().min(0).optional(),
    allowed_zip_codes: z.array(z.string()).optional(),
    discount_10for9: z.boolean().optional(),
    pickup_address: z.string().optional(),
    contact_email: z.string().email().optional(),
    payment_methods_enabled: z.array(z.enum(['BANK_TRANSFER', 'ON_SITE'])).optional(),
    payment_iban_override: z.string().nullable().optional(),
    payment_iban_name_override: z.string().nullable().optional(),
    order_code_prefix: z.string().optional(),
  }).optional(),
})

/**
 * GET /api/admin/events/[id]
 * Récupère les détails complets d'un événement
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createServerClient()

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        section:sections(
          id,
          name,
          slug,
          color,
          iban,
          iban_name
        )
      `)
      .eq('id', id)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    // Récupérer les produits
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('event_id', id)
      .order('sort_order', { ascending: true })

    // Récupérer les créneaux
    const { data: slots } = await supabase
      .from('slots')
      .select('*')
      .eq('event_id', id)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    // Récupérer les stats des commandes
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id)

    const { data: ordersByStatus } = await supabase
      .from('orders')
      .select('status')
      .eq('event_id', id)

    const statusCounts = (ordersByStatus || []).reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      event: {
        ...event,
        products: products || [],
        slots: slots || [],
        stats: {
          ordersCount: ordersCount || 0,
          ordersByStatus: statusCounts,
        },
      },
    })
  } catch (error) {
    console.error('Erreur GET admin event:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/events/[id]
 * Met à jour un événement
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateEventSchema.parse(body)

    const supabase = createServerClient()

    // Vérifier que l'événement existe
    const { data: existingEvent, error: existingError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (existingError || !existingEvent) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    // Si changement de slug, vérifier qu'il n'existe pas déjà
    if (validatedData.slug && validatedData.slug !== existingEvent.slug) {
      const { data: slugExists } = await supabase
        .from('events')
        .select('id')
        .eq('slug', validatedData.slug)
        .neq('id', id)
        .single()

      if (slugExists) {
        return NextResponse.json(
          { error: 'Un événement avec ce slug existe déjà' },
          { status: 400 }
        )
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = { ...validatedData }

    // Merger les config JSONB si partielles
    if (validatedData.hero_config) {
      updateData.hero_config = {
        ...existingEvent.hero_config,
        ...validatedData.hero_config,
      }
    }

    if (validatedData.config) {
      updateData.config = {
        ...existingEvent.config,
        ...validatedData.config,
      }
    }

    // Mettre à jour l'événement
    const { data: event, error: updateError } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur mise à jour événement:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'événement' },
        { status: 500 }
      )
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      event_id: event.id,
      action: 'EVENT_UPDATED',
      meta: {
        event_name: event.name,
        updated_fields: Object.keys(validatedData),
      },
    })

    return NextResponse.json({ event })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur PATCH admin event:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/events/[id]
 * Supprime un événement (seulement si aucune commande)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createServerClient()

    // Vérifier que l'événement existe
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('name')
      .eq('id', id)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      )
    }

    // Vérifier qu'il n'y a aucune commande
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id)

    if ((ordersCount || 0) > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un événement avec des commandes' },
        { status: 400 }
      )
    }

    // Supprimer l'événement (CASCADE supprime products et slots)
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Erreur suppression événement:', deleteError)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'événement' },
        { status: 500 }
      )
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      action: 'EVENT_DELETED',
      meta: { event_name: event.name },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur DELETE admin event:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
