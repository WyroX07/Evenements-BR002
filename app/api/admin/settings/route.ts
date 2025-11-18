import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { settingsSchema } from '@/lib/validators'
import { z } from 'zod'

/**
 * GET /api/admin/settings
 * Récupère tous les paramètres
 */
export async function GET() {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createServerClient()

    const { data: settingsData, error } = await supabase
      .from('settings')
      .select('key, value')

    if (error) {
      console.error('Erreur récupération paramètres:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des paramètres' },
        { status: 500 }
      )
    }

    // Convertir en objet
    const settings = Object.fromEntries(
      (settingsData || []).map((s) => [s.key, s.value])
    )

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Erreur GET settings:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/settings
 * Met à jour tous les paramètres
 */
export async function PUT(request: NextRequest) {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = settingsSchema.parse(body)

    const supabase = createServerClient()

    // Mapper vers le format key-value
    const updates = [
      { key: 'pickup_address', value: validatedData.pickupAddress },
      { key: 'delivery_enabled', value: validatedData.deliveryEnabled },
      { key: 'delivery_min_bottles', value: validatedData.deliveryMinBottles },
      { key: 'delivery_fee_cents', value: validatedData.deliveryFeeCents },
      { key: 'allowed_zip_codes', value: validatedData.allowedZipCodes },
      { key: 'discount_10for9', value: validatedData.discount10for9 },
      { key: 'pay_link_url', value: validatedData.payLinkUrl || '' },
      { key: 'contact_email', value: validatedData.contactEmail },
      { key: 'headline', value: validatedData.headline || '' },
      { key: 'privacy_text', value: validatedData.privacyText || '' },
      { key: 'sale_deadline', value: validatedData.saleDeadline || null },
    ]

    // Upsert chaque paramètre
    for (const update of updates) {
      const { error } = await supabase
        .from('settings')
        .upsert(update, { onConflict: 'key' })

      if (error) {
        console.error(`Erreur mise à jour paramètre ${update.key}:`, error)
        return NextResponse.json(
          { error: `Erreur lors de la mise à jour du paramètre ${update.key}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur PUT settings:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
