import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey) {
  throw new Error('RESEND_API_KEY doit être défini dans .env')
}

export const resend = new Resend(resendApiKey)

/**
 * Détermine l'adresse d'envoi (from) selon la configuration
 * - Si SENDER_EMAIL est défini: utilise le domaine personnalisé
 * - Sinon: utilise le fallback @resend.dev
 */
export function getSenderEmail(): string {
  const senderName = process.env.SENDER_NAME || 'Les Pionniers d\'Ecaussinnes'
  const senderEmail = process.env.SENDER_EMAIL

  if (senderEmail && senderEmail.trim() !== '') {
    return `${senderName} <${senderEmail}>`
  }

  // Fallback sur @resend.dev
  return `${senderName} <pionniers@resend.dev>`
}

/**
 * Email de contact pour les réponses
 */
export function getContactEmail(): string {
  return process.env.CONTACT_EMAIL || 'contact@pionniers-ecaussinnes.be'
}

/**
 * Données pour l'email de confirmation de commande
 */
export interface OrderConfirmationData {
  orderCode: string
  customerName: string
  customerEmail: string
  eventName: string
  sectionName: string
  sectionColor: string
  totalCents: number
  items: Array<{
    name: string
    quantity: number
    unitPriceCents: number
  }>
  deliveryType: 'PICKUP' | 'DELIVERY' | 'ON_SITE'
  deliveryAddress?: string
  slotDate?: string
  slotTime?: string
  paymentMethod: 'BANK_TRANSFER' | 'ON_SITE'
  paymentCommunication?: string
  iban?: string
  ibanName?: string
  discount?: number
  confirmationUrl: string
  qrCodeDataUrl?: string
}

/**
 * Génère le HTML de l'email de confirmation de commande
 */
export function generateOrderConfirmationHTML(data: OrderConfirmationData): string {
  const formatPrice = (cents: number) => (cents / 100).toFixed(2) + ' €'
  const subtotal = data.items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0)

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de commande</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with section color -->
          <tr>
            <td style="height: 8px; background: linear-gradient(90deg, ${data.sectionColor} 0%, ${data.sectionColor}cc 100%);"></td>
          </tr>

          <!-- Success Icon & Title -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <div style="width: 64px; height: 64px; margin: 0 auto 20px; background-color: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 32px;">✓</span>
              </div>
              <h1 style="margin: 0 0 10px; font-size: 28px; font-weight: bold; color: #111827;">Commande confirmée !</h1>
              <p style="margin: 0; font-size: 16px; color: #6b7280;">
                Merci pour votre soutien aux ${data.sectionName}
              </p>
            </td>
          </tr>

          <!-- Order Code -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" style="width: 100%; background-color: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 20px;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #92400e; font-weight: 600;">NUMÉRO DE COMMANDE</p>
                    <p style="margin: 0; font-size: 32px; font-weight: bold; color: #d97706; letter-spacing: 2px;">${data.orderCode}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- QR Code Info -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #f0f9ff; border: 2px solid #0284c7; border-radius: 12px; padding: 24px; text-align: center;">
                <p style="margin: 0 0 16px; font-size: 14px; color: #075985; font-weight: 600;">📱 QR CODE DE ${data.deliveryType === 'PICKUP' ? 'RETRAIT' : data.deliveryType === 'DELIVERY' ? 'LIVRAISON' : 'PRÉSENCE'}</p>
                <p style="margin: 0 0 20px; font-size: 14px; color: #075985;">
                  ${data.deliveryType === 'PICKUP' ? 'Présentez votre QR code lors du retrait de votre commande' : data.deliveryType === 'DELIVERY' ? 'Présentez votre QR code lors de la livraison' : 'Présentez votre QR code sur place'}
                </p>
                <a href="${data.confirmationUrl}" style="display: inline-block; background-color: #0284c7; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                  Voir mon QR code
                </a>
                <p style="margin: 16px 0 0; font-size: 12px; color: #64748b;">
                  Cliquez sur le bouton ci-dessus pour afficher votre QR code
                </p>
              </div>
            </td>
          </tr>

          <!-- Event Info -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: ${data.sectionColor}15; border: 1px solid ${data.sectionColor}30; border-radius: 12px; padding: 16px;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Événement</p>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #111827;">${data.eventName}</p>
                <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">${data.sectionName}</p>
              </div>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #111827;">Détail de la commande</h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #e5e7eb;">
                    <th style="text-align: left; padding: 12px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Produit</th>
                    <th style="text-align: center; padding: 12px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Qté</th>
                    <th style="text-align: right; padding: 12px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Prix unit.</th>
                    <th style="text-align: right; padding: 12px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.items.map(item => `
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 16px 0; font-size: 14px; color: #111827;">${item.name}</td>
                    <td style="text-align: center; padding: 16px 0; font-size: 14px; color: #6b7280;">${item.quantity}</td>
                    <td style="text-align: right; padding: 16px 0; font-size: 14px; color: #6b7280;">${formatPrice(item.unitPriceCents)}</td>
                    <td style="text-align: right; padding: 16px 0; font-size: 14px; font-weight: 600; color: #111827;">${formatPrice(item.unitPriceCents * item.quantity)}</td>
                  </tr>
                  `).join('')}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="text-align: right; padding: 12px 0; font-size: 14px; color: #6b7280;">Sous-total :</td>
                    <td style="text-align: right; padding: 12px 0; font-size: 14px; font-weight: 600; color: #111827;">${formatPrice(subtotal)}</td>
                  </tr>
                  ${data.discount && data.discount > 0 ? `
                  <tr>
                    <td colspan="3" style="text-align: right; padding: 8px 0; font-size: 14px; color: #10b981;">Promotion 12 bouteilles (10€) :</td>
                    <td style="text-align: right; padding: 8px 0; font-size: 14px; font-weight: 600; color: #10b981;">-${formatPrice(data.discount)}</td>
                  </tr>
                  ` : ''}
                  <tr style="border-top: 2px solid #e5e7eb;">
                    <td colspan="3" style="text-align: right; padding: 16px 0; font-size: 16px; font-weight: bold; color: #111827;">TOTAL :</td>
                    <td style="text-align: right; padding: 16px 0; font-size: 20px; font-weight: bold; color: ${data.sectionColor};">${formatPrice(data.totalCents)}</td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>

          ${data.deliveryType === 'PICKUP' && data.slotDate && data.slotTime ? `
          <!-- Pickup Slot -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #dbeafe; border: 1px solid #3b82f6; border-radius: 12px; padding: 16px;">
                <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #1e40af;">📦 Créneau de retrait</p>
                <p style="margin: 0; font-size: 16px; color: #1f2937;">${data.slotDate} • ${data.slotTime}</p>
              </div>
            </td>
          </tr>
          ` : ''}

          ${data.deliveryType === 'DELIVERY' && data.deliveryAddress ? `
          <!-- Delivery Address -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #dbeafe; border: 1px solid #3b82f6; border-radius: 12px; padding: 16px;">
                <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #1e40af;">🚚 Adresse de livraison</p>
                <p style="margin: 0; font-size: 16px; color: #1f2937;">${data.deliveryAddress}</p>
              </div>
            </td>
          </tr>
          ` : ''}

          ${data.paymentMethod === 'BANK_TRANSFER' && data.iban && data.ibanName ? `
          <!-- Payment Instructions -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px;">
                <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: bold; color: #92400e;">💳 Instructions de paiement</h3>
                <p style="margin: 0 0 12px; font-size: 14px; color: #78350f;">Veuillez effectuer le virement bancaire avec les informations suivantes :</p>
                <table role="presentation" style="width: 100%; font-size: 14px; color: #78350f;">
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600;">Bénéficiaire :</td>
                    <td style="padding: 6px 0; text-align: right; font-family: 'Courier New', monospace;">${data.ibanName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600;">IBAN :</td>
                    <td style="padding: 6px 0; text-align: right; font-family: 'Courier New', monospace;">${data.iban}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600;">Montant :</td>
                    <td style="padding: 6px 0; text-align: right; font-size: 18px; font-weight: bold; color: ${data.sectionColor};">${formatPrice(data.totalCents)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600;">Communication :</td>
                    <td style="padding: 6px 0; text-align: right;">
                      <span style="background-color: white; padding: 4px 12px; border-radius: 6px; border: 1px solid #f59e0b; font-family: 'Courier New', monospace; font-weight: bold;">${data.paymentCommunication}</span>
                    </td>
                  </tr>
                </table>
                <p style="margin: 16px 0 0; padding-top: 16px; border-top: 1px solid #f59e0b; font-size: 13px; color: #92400e;">
                  <strong>⚠️ Important :</strong> N'oubliez pas d'indiquer la communication structurée pour que nous puissions identifier votre paiement.
                </p>
              </div>
            </td>
          </tr>
          ` : ''}

          ${data.paymentMethod === 'ON_SITE' ? `
          <!-- On-site Payment -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #dbeafe; border: 1px solid #3b82f6; border-radius: 12px; padding: 16px;">
                <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #1e40af;">💳 Paiement sur place</p>
                <p style="margin: 0; font-size: 16px; color: #1f2937;">Montant à régler : <strong style="color: ${data.sectionColor};">${formatPrice(data.totalCents)}</strong></p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="${data.confirmationUrl}" style="display: inline-block; background-color: ${data.sectionColor}; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                Voir ma commande
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 12px; font-size: 14px; color: #6b7280; text-align: center;">
                Des questions ? Contactez-nous à <a href="mailto:${getContactEmail()}" style="color: ${data.sectionColor}; text-decoration: none; font-weight: 600;">${getContactEmail()}</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                ${data.sectionName} • Commande n°${data.orderCode}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Envoie un email de confirmation de commande
 */
export async function sendOrderConfirmation(data: OrderConfirmationData) {
  const html = generateOrderConfirmationHTML(data)
  const from = getSenderEmail()
  const subject = `Confirmation de commande ${data.orderCode} - ${data.eventName}`

  // Logging détaillé avant envoi
  console.log('[sendOrderConfirmation] Début envoi email:', {
    orderCode: data.orderCode,
    to: data.customerEmail,
    from,
    eventName: data.eventName,
    paymentMethod: data.paymentMethod,
    totalCents: data.totalCents,
  })

  try {
    const startTime = Date.now()

    const response = await resend.emails.send({
      from,
      to: data.customerEmail,
      subject,
      html,
    })

    const duration = Date.now() - startTime

    // Logging du succès avec détails
    console.log('[sendOrderConfirmation] ✅ Email envoyé avec succès:', {
      orderCode: data.orderCode,
      to: data.customerEmail,
      emailId: response.id,
      duration: `${duration}ms`,
    })

    return { success: true, response }
  } catch (error) {
    // Logging détaillé de l'erreur
    console.error('[sendOrderConfirmation] ❌ Erreur envoi email:', {
      orderCode: data.orderCode,
      to: data.customerEmail,
      from,
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack,
      } : error,
    })

    return { success: false, error }
  }
}
