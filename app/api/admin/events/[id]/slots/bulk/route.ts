import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

const bulkSlotSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  intervalMinutes: z.number().min(5).max(240),
  capacity: z.number().min(1),
  daysOfWeek: z.array(z.number().min(0).max(6)),
})

/**
 * Vérifie si l'utilisateur est authentifié comme admin
 */
async function checkAdminAuth() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin_session')

  if (!adminSession || adminSession.value !== 'authenticated') {
    return false
  }
  return true
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await checkAdminAuth())) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: eventId } = await params
    const supabase = createServerClient() as any

    const body = await req.json()
    const validatedData = bulkSlotSchema.parse(body)

    const { startDate, endDate, startTime, endTime, intervalMinutes, capacity, daysOfWeek } = validatedData

    // Générer tous les créneaux
    const slots = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Pour chaque jour dans la période
    let currentDate = new Date(start)
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay()

      // Si ce jour est sélectionné
      if (daysOfWeek.includes(dayOfWeek)) {
        const dateStr = currentDate.toISOString().split('T')[0]

        // Générer les créneaux pour ce jour
        const [startHour, startMin] = startTime.split(':').map(Number)
        const [endHour, endMin] = endTime.split(':').map(Number)
        const startMinutes = startHour * 60 + startMin
        const endMinutes = endHour * 60 + endMin

        let currentMinutes = startMinutes
        while (currentMinutes < endMinutes) {
          const slotStartHour = Math.floor(currentMinutes / 60)
          const slotStartMin = currentMinutes % 60
          const slotStart = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`

          const nextMinutes = currentMinutes + intervalMinutes
          const slotEndHour = Math.floor(nextMinutes / 60)
          const slotEndMin = nextMinutes % 60
          const slotEnd = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`

          slots.push({
            event_id: eventId,
            date: dateStr,
            start_time: slotStart,
            end_time: slotEnd,
            capacity,
          })

          currentMinutes = nextMinutes
        }
      }

      // Passer au jour suivant
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Insérer tous les créneaux en une seule requête
    const { data, error } = await supabase.from('slots').insert(slots).select()

    if (error) {
      console.error('Erreur création créneaux:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: `${slots.length} créneaux créés avec succès`,
      count: slots.length,
      slots: data,
    })
  } catch (error: any) {
    console.error('Erreur génération créneaux:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}
