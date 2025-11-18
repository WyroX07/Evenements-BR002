import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'SUPABASE_URL et SUPABASE_ANON_KEY doivent être définis dans .env'
  )
}

/**
 * Client Supabase avec clé anon pour les opérations publiques (côté client)
 * Respecte RLS - lecture seule pour les données publiques
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
