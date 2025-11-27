import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

async function checkAdminAuth() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')
  if (!adminSession || adminSession.value !== 'authenticated') {
    return false
  }
  return true
}

const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'PREPARED', 'DELIVERED', 'CANCELLED']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createServerClient() as any

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        event:events(
          id,
          name,
          slug,
          section:sections(
            id,
            name,
            slug,
            color
          )
        ),
        slot:slots(
          id,
          date,
          start_time,
          end_time
        )
      `)
      .eq('id', id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    const { data: items } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(id, name, product_type)
      `)
      .eq('order_id', id)

    return NextResponse.json({ order: { ...order, items: items || [] } })
  } catch (error) {
    console.error('Error GET order:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await checkAdminAuth()) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateOrderSchema.parse(body)
    const supabase = createServerClient() as any

    const { data: order, error } = await supabase
      .from('orders')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Erreur mise a jour' }, { status: 500 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error PATCH order:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
