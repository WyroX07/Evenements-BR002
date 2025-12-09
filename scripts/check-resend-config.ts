/**
 * Script de vérification de la configuration Resend
 * Usage: npx tsx scripts/check-resend-config.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement depuis .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { resend } from '../lib/emails'

async function checkResendConfig() {
  console.log('🔍 Vérification de la configuration Resend\n')
  console.log('=' .repeat(60))

  // 1. Vérifier la clé API
  console.log('\n📝 1. Configuration de l\'API')
  console.log('-'.repeat(60))
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY non défini dans .env.local')
    process.exit(1)
  }
  console.log(`✅ Clé API : ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`)

  // 2. Vérifier la configuration de l'expéditeur
  console.log('\n📧 2. Configuration de l\'expéditeur')
  console.log('-'.repeat(60))
  const senderEmail = process.env.SENDER_EMAIL
  const senderName = process.env.SENDER_NAME
  console.log(`Nom : ${senderName || '(non défini)'}`)
  console.log(`Email : ${senderEmail || '(non défini)'}`)

  if (!senderEmail) {
    console.warn('⚠️  SENDER_EMAIL non défini, utilisation du fallback @resend.dev')
  } else {
    console.log('✅ Configuration expéditeur OK')
  }

  // 3. Tester l'API Resend - Liste des domaines
  console.log('\n🌐 3. Domaines configurés sur Resend')
  console.log('-'.repeat(60))
  try {
    // Note: L'API Resend ne permet pas de lister les domaines via le SDK
    // Il faut vérifier manuellement sur https://resend.com/domains
    console.log('ℹ️  Pour vérifier les domaines, rendez-vous sur :')
    console.log('   👉 https://resend.com/domains')
    console.log('\nVérifiez que scouts-ecaussinnes.be est :')
    console.log('  ✅ Vérifié (Verified)')
    console.log('  ✅ SPF configuré')
    console.log('  ✅ DKIM configuré')
    console.log('  ✅ DMARC configuré (optionnel mais recommandé)')
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des domaines:', error)
  }

  // 4. Tester l'envoi d'un email de test (optionnel)
  console.log('\n📨 4. Test d\'envoi d\'email')
  console.log('-'.repeat(60))
  console.log('Pour tester l\'envoi d\'un email :')
  console.log('  npx tsx scripts/test-email.ts <votre-email>')
  console.log('\nExemple :')
  console.log('  npx tsx scripts/test-email.ts test@skynet.be')

  // 5. Vérifier les limites d'envoi
  console.log('\n📊 5. Limites et quotas')
  console.log('-'.repeat(60))
  console.log('Pour vérifier vos limites d\'envoi, rendez-vous sur :')
  console.log('  👉 https://resend.com/overview')
  console.log('\nLimites par défaut :')
  console.log('  Free tier : 100 emails/jour, 3000/mois')
  console.log('  Pro tier  : Illimité')

  // 6. Vérifier les emails récents
  console.log('\n📬 6. Historique des emails')
  console.log('-'.repeat(60))
  console.log('Pour voir tous les emails envoyés :')
  console.log('  👉 https://resend.com/emails')
  console.log('\nVous pouvez filtrer par :')
  console.log('  • Date')
  console.log('  • Destinataire')
  console.log('  • Statut (delivered, bounced, failed, etc.)')

  // 7. Webhooks
  console.log('\n🔔 7. Webhooks (recommandé)')
  console.log('-'.repeat(60))
  console.log('Pour suivre le statut des emails en temps réel :')
  console.log('  1. Aller sur https://resend.com/webhooks')
  console.log('  2. Ajouter : https://evenements.scouts-ecaussinnes.be/api/webhooks/resend')
  console.log('  3. Sélectionner les événements :')
  console.log('     • email.sent')
  console.log('     • email.delivered')
  console.log('     • email.bounced')
  console.log('     • email.complained')

  // 8. Résumé et recommandations
  console.log('\n' + '='.repeat(60))
  console.log('✅ VÉRIFICATION TERMINÉE')
  console.log('='.repeat(60))
  console.log('\n📋 Actions recommandées :')
  console.log('  1. Vérifier la configuration du domaine sur Resend')
  console.log('  2. Tester l\'envoi vers différents fournisseurs d\'email')
  console.log('  3. Configurer les webhooks pour le tracking en temps réel')
  console.log('  4. Implémenter la table email_logs (voir DIAGNOSTIC_EMAILS.md)')
  console.log('\n📚 Documentation :')
  console.log('  • API : https://resend.com/docs')
  console.log('  • Webhooks : https://resend.com/docs/dashboard/webhooks/introduction')
  console.log('  • Status : https://resend.com/docs/dashboard/emails/email-status')
  console.log('\n')
}

checkResendConfig().catch((error) => {
  console.error('\n💥 Erreur lors de la vérification :', error)
  process.exit(1)
})
