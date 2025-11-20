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
 * PATCH /api/admin/promo-codes/[id]
 * Modifie un code promo
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdminAuth()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { code, discountCents, description, isActive } = body

    const supabase = createServerClient() as any

    const updateData: any = {}

    if (code !== undefined) {
      updateData.code = code.trim().toUpperCase()
    }
    if (discountCents !== undefined) {
      if (discountCents <= 0) {
        return NextResponse.json(
          { error: 'Montant de réduction invalide' },
          { status: 400 }
        )
      }
      updateData.discount_cents = discountCents
    }
    if (description !== undefined) {
      updateData.description = description || null
    }
    if (isActive !== undefined) {
      updateData.is_active = isActive
    }

    const { data: promoCode, error } = await supabase
      .from('promo_codes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating promo code:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du code promo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ promoCode })
  } catch (error) {
    console.error('Error in PATCH /api/admin/promo-codes/[id]:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/promo-codes/[id]
 * Supprime un code promo
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdminAuth()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createServerClient() as any

    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting promo code:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du code promo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/promo-codes/[id]:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
