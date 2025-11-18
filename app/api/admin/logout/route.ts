import { NextResponse } from 'next/server'
import { deleteAdminCookie } from '@/lib/auth'

/**
 * POST /api/admin/logout
 * Déconnecte l'administrateur
 */
export async function POST() {
  try {
    await deleteAdminCookie()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur logout admin:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
