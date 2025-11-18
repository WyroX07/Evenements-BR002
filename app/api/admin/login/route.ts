import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword, setAdminCookie, isRateLimited, recordLoginAttempt } from '@/lib/auth'
import { getClientIp } from '@/lib/utils'
import { loginSchema } from '@/lib/validators'
import { z } from 'zod'

/**
 * POST /api/admin/login
 * Authentifie un administrateur
 */
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)

    // Vérifier le rate limiting
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { password } = loginSchema.parse(body)

    // Vérifier le mot de passe
    const isValid = verifyAdminPassword(password)

    // Enregistrer la tentative
    recordLoginAttempt(clientIp, isValid)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Définir le cookie de session
    await setAdminCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      )
    }

    console.error('Erreur login admin:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
