import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine les classes CSS avec Tailwind merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Génère un code de commande lisible
 * Format: PEC-YYYY-#####
 * @param year Année
 * @param orderNumber Numéro de commande
 */
export function generateOrderCode(year: number, orderNumber: number): string {
  const paddedNumber = orderNumber.toString().padStart(5, '0')
  return `PEC-${year}-${paddedNumber}`
}

/**
 * Extrait l'IP du client depuis la requête
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp.trim()
  }

  return 'unknown'
}

/**
 * Valide un format de code postal belge
 */
export function isValidBelgianZip(zip: string): boolean {
  return /^\d{4}$/.test(zip)
}

/**
 * Valide un format d'email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valide un format de téléphone belge
 */
export function isValidBelgianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\.\(\)]/g, '')
  return /^(\+32|0032|0)[1-9]\d{7,8}$/.test(cleaned)
}

/**
 * Formatte un numéro de téléphone belge
 */
export function formatBelgianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\.\(\)]/g, '')

  if (cleaned.startsWith('+32')) {
    return cleaned.replace(/(\+32)(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }

  if (cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')
  }

  return phone
}

/**
 * Tronque un texte avec ellipse
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Delay/sleep helper pour async
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
