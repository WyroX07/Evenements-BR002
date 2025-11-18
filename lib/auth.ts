import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const COOKIE_NAME = 'admin_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 jours

if (!ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD doit être défini dans .env')
}

/**
 * Vérifie le mot de passe admin
 */
export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

/**
 * Définit le cookie de session admin
 */
export async function setAdminCookie() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

/**
 * Supprime le cookie de session admin
 */
export async function deleteAdminCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/**
 * Vérifie si l'utilisateur est authentifié en tant qu'admin
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(COOKIE_NAME)
  return sessionCookie?.value === 'authenticated'
}

/**
 * Alias pour isAdminAuthenticated (utilisé dans les API routes)
 */
export async function checkAdminAuth(): Promise<boolean> {
  return isAdminAuthenticated()
}

/**
 * Middleware pour protéger les routes admin
 * Redirige vers /admin/login si non authentifié
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const authenticated = await isAdminAuthenticated()

  if (!authenticated) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return null
}

/**
 * Rate limiting simple pour le login admin
 * Stocke les tentatives en mémoire (en production, utiliser Redis)
 */
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

/**
 * Vérifie si l'IP est rate limitée
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const attempts = loginAttempts.get(ip)

  if (!attempts) {
    return false
  }

  if (now > attempts.resetAt) {
    loginAttempts.delete(ip)
    return false
  }

  return attempts.count >= MAX_ATTEMPTS
}

/**
 * Enregistre une tentative de connexion
 */
export function recordLoginAttempt(ip: string, success: boolean) {
  const now = Date.now()
  const attempts = loginAttempts.get(ip)

  if (success) {
    loginAttempts.delete(ip)
    return
  }

  if (!attempts || now > attempts.resetAt) {
    loginAttempts.set(ip, {
      count: 1,
      resetAt: now + LOCKOUT_DURATION,
    })
  } else {
    attempts.count++
  }
}

/**
 * Nettoie les anciennes entrées de rate limiting
 * À appeler périodiquement
 */
export function cleanupRateLimiting() {
  const now = Date.now()
  for (const [ip, data] of loginAttempts.entries()) {
    if (now > data.resetAt) {
      loginAttempts.delete(ip)
    }
  }
}
