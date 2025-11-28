import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function checkAdminAuth() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')
  if (!adminSession || adminSession.value !== 'authenticated') {
    return false
  }
  return true
}

/**
 * GET /api/admin/search
 * Search orders by order code, customer name, email, or phone
 */
export async function GET(request: NextRequest) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    const supabase = createServerClient() as any
    const searchTerm = query.trim()

    // Search in multiple fields using OR conditions
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        code,
        customer_name,
        email,
        phone,
        status,
        total_cents,
        created_at,
        delivery_type,
        event:events(
          id,
          name
        )
      `)
      .or(`code.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[GET /api/admin/search] Error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la recherche' },
        { status: 500 }
      )
    }

    return NextResponse.json({ results: orders || [] })
  } catch (error) {
    console.error('[GET /api/admin/search] Unexpected error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
