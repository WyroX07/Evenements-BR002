/**
 * Script de test pour l'envoi d'emails via Resend
 * Usage: npx tsx scripts/test-email.ts <email-destinataire>
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement depuis .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { sendOrderConfirmation } from '../lib/emails'
import type { OrderConfirmationData } from '../lib/emails'

// Données de test pour simuler une commande
const testOrderData: OrderConfirmationData = {
  orderCode: 'TEST-00001',
  customerName: 'Test Client',
  customerEmail: process.argv[2] || 'test@example.com',
  eventName: 'Test Vente Crémant 2025',
  sectionName: 'Pionniers Test',
  sectionColor: '#f59e0b',
  totalCents: 12500, // 125.00 €
  items: [
    {
      name: 'Crémant Brut',
      quantity: 2,
      unitPriceCents: 5000,
    },
    {
      name: 'Crémant Rosé',
      quantity: 1,
      unitPriceCents: 2500,
    },
  ],
  deliveryType: 'PICKUP',
  slotDate: '15 janvier 2025',
  slotTime: '14:00 - 17:00',
  paymentMethod: 'BANK_TRANSFER',
  paymentCommunication: 'Test Client - Cremant 25',
  iban: 'BE68 5390 0754 7034',
  ibanName: 'Unité Scoute Test',
  discount: 500, // 5.00 € de remise
  confirmationUrl: 'https://evenements.scouts-ecaussinnes.be/merci/TEST-00001',
  qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
}

async function testEmail() {
  console.log('🚀 Test d\'envoi d\'email via Resend')
  console.log('📧 Destinataire:', testOrderData.customerEmail)
  console.log('📝 Code commande:', testOrderData.orderCode)
  console.log('💰 Montant:', (testOrderData.totalCents / 100).toFixed(2), '€')
  console.log('---')

  try {
    console.log('⏳ Envoi en cours...')
    const startTime = Date.now()

    const result = await sendOrderConfirmation(testOrderData)

    const duration = Date.now() - startTime
    console.log(`⏱️  Temps d'envoi: ${duration}ms`)
    console.log('---')

    if (result.success) {
      console.log('✅ Email envoyé avec succès!')
      console.log('📨 Réponse Resend:', JSON.stringify(result.response, null, 2))

      // Informations utiles de Resend
      if (result.response && typeof result.response === 'object' && 'id' in result.response) {
        console.log('---')
        console.log('🔍 ID de l\'email:', result.response.id)
        console.log('📊 Vous pouvez vérifier le statut sur: https://resend.com/emails/' + result.response.id)
      }
    } else {
      console.error('❌ Échec de l\'envoi')
      console.error('⚠️  Erreur:', result.error)

      // Détails supplémentaires sur l'erreur
      if (result.error && typeof result.error === 'object') {
        console.error('---')
        console.error('📋 Détails de l\'erreur:', JSON.stringify(result.error, null, 2))
      }
    }
  } catch (error) {
    console.error('💥 Erreur critique:', error)
    process.exit(1)
  }
}

// Vérification des arguments
if (process.argv.length < 3) {
  console.log('⚠️  Usage: npx tsx scripts/test-email.ts <email-destinataire>')
  console.log('📧 Exemple: npx tsx scripts/test-email.ts test@skynet.be')
  process.exit(1)
}

// Validation basique de l'email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(testOrderData.customerEmail)) {
  console.error('❌ Adresse email invalide:', testOrderData.customerEmail)
  process.exit(1)
}

testEmail()
