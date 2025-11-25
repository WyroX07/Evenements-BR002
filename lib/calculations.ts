/**
 * Logique de calcul des montants de commande
 * Gestion de la remise "12 pour 11" (2 caisses = 1 bouteille offerte) et des frais de livraison
 */

interface CartItem {
  cuveeId: string
  qty: number
  unitPriceCents: number
}

interface OrderTotals {
  subtotalCents: number
  discountCents: number
  deliveryFeeCents: number
  totalCents: number
}

/**
 * Calcule les totaux d'une commande
 * @param items Lignes de commande
 * @param applyDiscount Appliquer la remise 12=11
 * @param deliveryFeeCents Frais de livraison (0 si retrait)
 * @returns Totaux calculés
 */
export function calculateOrderTotals(
  items: CartItem[],
  applyDiscount: boolean,
  deliveryFeeCents: number = 0
): OrderTotals {
  // Calcul du sous-total
  const subtotalCents = items.reduce((sum, item) => {
    return sum + item.qty * item.unitPriceCents
  }, 0)

  // Calcul de la remise "12 pour 11"
  let discountCents = 0
  if (applyDiscount) {
    discountCents = calculate12for11Discount(items)
  }

  // Total final
  const totalCents = subtotalCents - discountCents + deliveryFeeCents

  return {
    subtotalCents,
    discountCents,
    deliveryFeeCents,
    totalCents,
  }
}

/**
 * Calcule la remise "12 bouteilles pour le prix de 11" (2 caisses = 1 bouteille offerte)
 * Algorithme :
 * 1. Calculer le nombre total de bouteilles
 * 2. Pour chaque groupe de 12 bouteilles (2 caisses), offrir la moins chère
 * 3. Approche simplifiée : discount = (total_qty / 12) * prix_unitaire_min
 *
 * @param items Lignes de commande
 * @returns Montant de la remise en centimes
 */
export function calculate12for11Discount(items: CartItem[]): number {
  if (items.length === 0) return 0

  // Total de bouteilles commandées
  const totalBottles = items.reduce((sum, item) => sum + item.qty, 0)

  // Nombre de groupes de 12 (2 caisses de 6)
  const groups = Math.floor(totalBottles / 12)

  if (groups === 0) return 0

  // Prix unitaire minimum parmi toutes les cuvées
  const minUnitPrice = Math.min(...items.map((item) => item.unitPriceCents))

  // Remise = nombre de groupes × prix le moins cher
  return groups * minUnitPrice
}

/**
 * @deprecated Utilisez calculate12for11Discount à la place
 */
export function calculate10for9Discount(items: CartItem[]): number {
  return calculate12for11Discount(items)
}

/**
 * Vérifie si la commande atteint le minimum de bouteilles pour livraison
 * @param items Lignes de commande
 * @param minBottles Minimum requis
 * @returns true si le minimum est atteint
 */
export function meetsDeliveryMinimum(items: CartItem[], minBottles: number): boolean {
  const totalBottles = items.reduce((sum, item) => sum + item.qty, 0)
  return totalBottles >= minBottles
}

/**
 * Calcule le total de bouteilles dans le panier
 * @param items Lignes de commande
 * @returns Nombre total de bouteilles
 */
export function getTotalBottles(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0)
}

/**
 * Valide qu'il y a assez de stock pour une commande
 * @param items Lignes de commande
 * @param cuvees Cuvées avec stock disponible
 * @returns true si tout le stock est disponible
 */
export function validateStock(
  items: CartItem[],
  cuvees: Array<{ id: string; stock: number | null }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const item of items) {
    const cuvee = cuvees.find((c) => c.id === item.cuveeId)

    if (!cuvee) {
      errors.push(`Cuvée ${item.cuveeId} introuvable`)
      continue
    }

    if (cuvee.stock !== null && item.qty > cuvee.stock) {
      errors.push(`Stock insuffisant pour la cuvée ${item.cuveeId} (demandé: ${item.qty}, disponible: ${cuvee.stock})`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
