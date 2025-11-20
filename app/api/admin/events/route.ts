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

const eventSchema = z.object({
  slug: z.string().min(1),
  section_id: z.string().uuid(),
  event_type: z.enum(['PRODUCT_SALE', 'MEAL', 'RAFFLE']),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED']).default('DRAFT'),
  name: z.string().min(1),
  description: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hero_config: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    banner_url: z.string().url().nullable().optional(),
    show_deadline: z.boolean().default(true),
    show_stats: z.boolean().default(true),
    features: z.array(z.string()).default([]),
    cta_text: z.string().default('Commander maintenant'),
  }).optional(),
  config: z.object({
    delivery_enabled: z.boolean().default(false),
    delivery_min_bottles: z.number().int().min(0).default(5),
    delivery_fee_cents: z.number().int().min(0).default(0),
    allowed_zip_codes: z.array(z.string()).default([]),
    discount_10for9: z.boolean().default(false),
    pickup_address: z.string().optional(),
    contact_email: z.string().email().optional(),
    payment_methods_enabled: z.array(z.enum(['BANK_TRANSFER', 'ON_SITE'])).default(['BANK_TRANSFER', 'ON_SITE']),
    payment_iban_override: z.string().nullable().optional(),
    payment_iban_name_override: z.string().nullable().optional(),
    order_code_prefix: z.string().default('PEC'),
  }).optional(),
})

/**
 * GET /api/admin/events
 * Liste tous les événements (DRAFT, ACTIVE, CLOSED) avec filtrage par section optionnel
 */
export async function GET(request: NextRequest) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('section_id')
    const status = searchParams.get('status')

    const supabase = createServerClient() as any

    let query = supabase
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
      .order('created_at', { ascending: false })

    if (sectionId) {
      query = query.eq('section_id', sectionId)
    }

    if (status && ['DRAFT', 'ACTIVE', 'CLOSED'].includes(status)) {
      query = query.eq('status', status)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Erreur récupération événements admin:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des événements' },
        { status: 500 }
      )
    }

    // Ajouter les statistiques pour chaque événement
    const eventsWithStats = await Promise.all(
      (events || []).map(async (event: any) => {
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)

        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)

        const { count: slotsCount } = await supabase
          .from('slots')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)

        // Calculer le revenu total (somme des total_cents de toutes les commandes)
        const { data: orders } = await supabase
          .from('orders')
          .select('total_cents')
          .eq('event_id', event.id)

        const totalRevenueCents = (orders || []).reduce((sum: number, order: any) => sum + (order.total_cents || 0), 0)

        return {
          ...event,
          stats: {
            ordersCount: ordersCount || 0,
            productsCount: productsCount || 0,
            slotsCount: slotsCount || 0,
            totalRevenueCents,
          },
        }
      })
    )

    return NextResponse.json({ events: eventsWithStats })
  } catch (error) {
    console.error('Erreur GET admin events:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST /api/admin/events
 * Crée un nouvel événement
 */
export async function POST(request: NextRequest) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = eventSchema.parse(body)

    const supabase = createServerClient() as any

    // Vérifier que la section existe
    const { data: section, error: sectionError } = await supabase
      .from('sections')
      .select('id')
      .eq('id', validatedData.section_id)
      .single()

    if (sectionError || !section) {
      return NextResponse.json(
        { error: 'Section introuvable' },
        { status: 404 }
      )
    }

    // Vérifier que le slug n'existe pas déjà
    const { data: existingEvent } = await supabase
      .from('events')
      .select('id')
      .eq('slug', validatedData.slug)
      .single()

    if (existingEvent) {
      return NextResponse.json(
        { error: 'Un événement avec ce slug existe déjà' },
        { status: 400 }
      )
    }

    // Créer l'événement
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        slug: validatedData.slug,
        section_id: validatedData.section_id,
        event_type: validatedData.event_type,
        status: validatedData.status,
        name: validatedData.name,
        description: validatedData.description,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date,
        hero_config: validatedData.hero_config || {},
        config: validatedData.config || {},
      })
      .select()
      .single()

    if (eventError) {
      console.error('Erreur création événement:', eventError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'événement' },
        { status: 500 }
      )
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      event_id: event.id,
      action: 'EVENT_CREATED',
      meta: { event_name: event.name },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur POST admin events:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
