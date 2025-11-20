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
 * GET /api/admin/promo-codes
 * Récupère tous les codes promo
 */
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createServerClient() as any

    const { data: promoCodes, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching promo codes:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des codes promo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ promoCodes })
  } catch (error) {
    console.error('Error in GET /api/admin/promo-codes:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/promo-codes
 * Crée un nouveau code promo
 */
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { code, discountCents, description, isActive } = body

    // Validation
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code promo requis' },
        { status: 400 }
      )
    }

    if (!discountCents || discountCents <= 0) {
      return NextResponse.json(
        { error: 'Montant de réduction invalide' },
        { status: 400 }
      )
    }

    const supabase = createServerClient() as any

    // Vérifier si le code existe déjà
    const { data: existing } = await supabase
      .from('promo_codes')
      .select('id')
      .ilike('code', code.trim())
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Ce code promo existe déjà' },
        { status: 400 }
      )
    }

    // Créer le code promo
    const { data: promoCode, error } = await supabase
      .from('promo_codes')
      .insert({
        code: code.trim().toUpperCase(),
        discount_cents: discountCents,
        description: description || null,
        is_active: isActive !== undefined ? isActive : true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating promo code:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la création du code promo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ promoCode }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/promo-codes:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
