import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * POST /api/promo-codes/validate
 * Valide un code promo et retourne les infos de réduction
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code promo requis' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Rechercher le code promo (insensible à la casse)
    const { data: promoCode, error } = await supabase
      .from('promo_codes')
      .select('id, code, discount_cents, is_active, description')
      .ilike('code', code.trim())
      .single()

    if (error || !promoCode) {
      return NextResponse.json(
        { valid: false, error: 'Code promo invalide' },
        { status: 200 }
      )
    }

    // Vérifier si le code est actif
    if (!promoCode.is_active) {
      return NextResponse.json(
        { valid: false, error: 'Ce code promo n\'est plus actif' },
        { status: 200 }
      )
    }

    // Code valide
    return NextResponse.json({
      valid: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        discountCents: promoCode.discount_cents,
        description: promoCode.description,
      },
    })
  } catch (error) {
    console.error('Error validating promo code:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la validation' },
      { status: 500 }
    )
  }
}
