import { z } from 'zod'

/**
 * Schémas de validation Zod pour l'application
 */

// ========================================
// SCHEMAS PUBLICS (Commandes)
// ========================================

export const orderItemSchema = z.object({
  cuveeId: z.string().uuid('ID de cuvée invalide'),
  qty: z.number().int().min(1, 'La quantité doit être au moins 1'),
  unitPriceCents: z.number().int().min(0, 'Le prix doit être positif'),
})

export const createOrderSchema = z
  .object({
    // Informations client
    customerName: z
      .string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(100, 'Le nom est trop long'),
    email: z.string().email('Email invalide'),
    phone: z
      .string()
      .min(9, 'Numéro de téléphone invalide')
      .regex(
        /^(\+32|0032|0)[1-9]\d{7,8}$/,
        'Format de téléphone belge invalide'
      ),
    notes: z.string().max(500, 'Les notes sont limitées à 500 caractères').optional(),

    // Type de livraison
    deliveryType: z.enum(['PICKUP', 'DELIVERY'], {
      required_error: 'Le type de livraison est requis',
    }),

    // Créneau (obligatoire si PICKUP)
    slotId: z.string().uuid('ID de créneau invalide').nullable(),

    // Adresse (obligatoire si DELIVERY)
    address: z.string().min(5, 'Adresse trop courte').max(200).nullable(),
    city: z.string().min(2, 'Ville trop courte').max(100).nullable(),
    zip: z
      .string()
      .regex(/^\d{4}$/, 'Code postal belge invalide (4 chiffres)')
      .nullable(),

    // Méthode de paiement
    paymentMethod: z.enum(['BANK_TRANSFER', 'ON_SITE', 'PAY_LINK'], {
      required_error: 'La méthode de paiement est requise',
    }),

    // Lignes de commande
    items: z
      .array(orderItemSchema)
      .min(1, 'Au moins un article est requis')
      .max(20, 'Maximum 20 articles différents'),

    // Consentement RGPD
    rgpdConsent: z
      .boolean()
      .refine((val) => val === true, {
        message: 'Vous devez accepter la politique de confidentialité',
      }),

    // Code promo (optionnel)
    promoCode: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.deliveryType === 'PICKUP') {
        return data.slotId !== null
      }
      return true
    },
    {
      message: 'Un créneau est requis pour un retrait',
      path: ['slotId'],
    }
  )
  .refine(
    (data) => {
      if (data.deliveryType === 'DELIVERY') {
        return (
          data.address !== null &&
          data.city !== null &&
          data.zip !== null
        )
      }
      return true
    },
    {
      message: 'L\'adresse complète est requise pour une livraison',
      path: ['address'],
    }
  )

export type CreateOrderInput = z.infer<typeof createOrderSchema>

// ========================================
// SCHEMAS ADMIN (CRUD)
// ========================================

export const cuveeSchema = z.object({
  name: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom est trop long'),
  description: z.string().max(500, 'La description est limitée à 500 caractères').nullable(),
  priceCents: z.number().int().min(0, 'Le prix doit être positif'),
  isActive: z.boolean().default(true),
  stock: z.number().int().min(0, 'Le stock ne peut pas être négatif').nullable(),
  sortOrder: z.number().int().default(0),
})

export type CuveeInput = z.infer<typeof cuveeSchema>

export const slotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide (HH:mm)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide (HH:mm)'),
  capacity: z.number().int().min(1, 'La capacité doit être au moins 1'),
})

export type SlotInput = z.infer<typeof slotSchema>

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid('ID de commande invalide'),
  status: z.enum(['PENDING', 'PAID', 'PREPARED', 'DELIVERED', 'CANCELLED'], {
    required_error: 'Le statut est requis',
  }),
  override: z.boolean().optional(),
})

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>

export const updateOrderNotesSchema = z.object({
  orderId: z.string().uuid('ID de commande invalide'),
  bankReference: z.string().max(100).nullable().optional(),
  adminInternalNote: z.string().max(1000).nullable().optional(),
})

export type UpdateOrderNotesInput = z.infer<typeof updateOrderNotesSchema>

export const settingsSchema = z.object({
  pickupAddress: z.string().min(10, 'Adresse de retrait trop courte'),
  deliveryEnabled: z.boolean(),
  deliveryMinBottles: z.number().int().min(1),
  deliveryFeeCents: z.number().int().min(0),
  allowedZipCodes: z.array(z.string().regex(/^\d{4}$/)),
  discount10for9: z.boolean(),
  payLinkUrl: z.string().url().or(z.literal('')).optional(),
  contactEmail: z.string().email('Email de contact invalide'),
  headline: z.string().max(200).optional(),
  privacyText: z.string().max(5000).optional(),
  saleDeadline: z.string().datetime().nullable().optional(),
})

export type SettingsInput = z.infer<typeof settingsSchema>

// ========================================
// SCHEMAS LOGIN
// ========================================

export const loginSchema = z.object({
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export type LoginInput = z.infer<typeof loginSchema>

// ========================================
// SCHEMAS EXPORTS
// ========================================

export const exportFiltersSchema = z.object({
  status: z
    .enum(['PENDING', 'PAID', 'PREPARED', 'DELIVERED', 'CANCELLED'])
    .optional(),
  deliveryType: z.enum(['PICKUP', 'DELIVERY']).optional(),
  slotId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

export type ExportFilters = z.infer<typeof exportFiltersSchema>
