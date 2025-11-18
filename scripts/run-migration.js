const https = require('https')
const fs = require('fs')
const path = require('path')

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env.local')
  process.exit(1)
}

async function runMigration() {
  try {
    console.log('🔄 Lecture du fichier de migration...')
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250114_add_wine_details.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    console.log('🔄 Exécution de la migration via l\'API REST de Supabase...')

    // Extraire le project ID de l'URL
    const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1]

    const postData = JSON.stringify({ query: migrationSQL })

    const options = {
      hostname: `${projectId}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceRoleKey,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204) {
          console.log('✅ Migration exécutée avec succès!')
          console.log('📋 Résultat:', data || 'OK')
          console.log('\n🔄 Redémarrez le serveur de développement pour voir les changements.')
        } else {
          console.error('❌ Erreur HTTP:', res.statusCode)
          console.error('📋 Réponse:', data)
          console.log('\n⚠️  L\'API REST ne supporte pas cette opération.')
          console.log('📋 Veuillez copier le SQL suivant et l\'exécuter dans le SQL Editor de Supabase:\n')
          console.log('─'.repeat(80))
          console.log(migrationSQL)
          console.log('─'.repeat(80))
          console.log('\n🔗 Ouvrez: https://supabase.com/dashboard/project/' + projectId + '/sql')
        }
      })
    })

    req.on('error', (error) => {
      console.error('❌ Erreur réseau:', error.message)
      console.log('\n⚠️  Impossible de se connecter à Supabase.')
      console.log('📋 Veuillez copier le SQL suivant et l\'exécuter dans le SQL Editor de Supabase:\n')
      console.log('─'.repeat(80))
      console.log(migrationSQL)
      console.log('─'.repeat(80))
      console.log('\n🔗 Ouvrez: https://supabase.com/dashboard/project/' + projectId + '/sql')
    })

    req.write(postData)
    req.end()
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

runMigration()
