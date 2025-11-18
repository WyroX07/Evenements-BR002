/**
 * Utilitaires pour la manipulation de montants en centimes
 */

/**
 * Formate un montant en centimes en string avec symbole €
 * @param cents Montant en centimes
 * @returns String formatée (ex: "12,50 €")
 */
export function formatCents(cents: number): string {
  const euros = cents / 100
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(euros)
}

/**
 * Convertit des euros en centimes
 * @param euros Montant en euros
 * @returns Montant en centimes (arrondi)
 */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100)
}

/**
 * Convertit des centimes en euros
 * @param cents Montant en centimes
 * @returns Montant en euros
 */
export function centsToEuros(cents: number): number {
  return cents / 100
}
