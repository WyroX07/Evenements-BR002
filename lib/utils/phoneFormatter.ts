/**
 * Formate un numéro de téléphone belge au format 04xx/xx.xx.xx
 *
 * Accepte les formats :
 * - +32 4xx xx xx xx
 * - +324xxxxxxxx
 * - 04xx xx xx xx
 * - 04xxxxxxxx
 * - 4xx xx xx xx
 * - 4xxxxxxxx
 *
 * @param phone - Numéro de téléphone brut
 * @returns Numéro formaté en 04xx/xx.xx.xx ou le numéro original si invalide
 */
export function formatBelgianPhone(phone: string): string {
  // Retirer tous les espaces, tirets, points, slashes et parenthèses
  let cleaned = phone.replace(/[\s\-\.\/()\+]/g, '')

  // Si commence par 32 (indicatif belge), le retirer
  if (cleaned.startsWith('32')) {
    cleaned = '0' + cleaned.substring(2)
  }

  // Si commence par 4 mais pas par 04, ajouter le 0
  if (cleaned.startsWith('4') && !cleaned.startsWith('04')) {
    cleaned = '0' + cleaned
  }

  // Vérifier que ça commence par 04 et a exactement 10 chiffres
  if (!cleaned.startsWith('04') || cleaned.length !== 10) {
    return phone // Retourner le numéro original si invalide
  }

  // Formater en 04xx/xx.xx.xx
  return `${cleaned.substring(0, 4)}/${cleaned.substring(4, 6)}.${cleaned.substring(6, 8)}.${cleaned.substring(8, 10)}`
}

/**
 * Valide qu'un numéro de téléphone peut être formaté
 *
 * @param phone - Numéro de téléphone brut
 * @returns true si le numéro peut être formaté
 */
export function isValidBelgianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\.\/()\+]/g, '')
  const withPrefix = cleaned.startsWith('32') ? '0' + cleaned.substring(2) :
                     cleaned.startsWith('4') && !cleaned.startsWith('04') ? '0' + cleaned :
                     cleaned

  return withPrefix.startsWith('04') && withPrefix.length === 10 && /^\d+$/.test(withPrefix)
}
