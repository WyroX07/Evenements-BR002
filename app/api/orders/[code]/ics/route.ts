import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const TIMEZONE = 'Europe/Brussels'

/**
 * Génère une chaîne de date au format iCalendar (YYYYMMDDTHHMMSS)
 */
function formatICSDate(date: Date): string {
  return formatInTimeZone(date, TIMEZONE, "yyyyMMdd'T'HHmmss")
}

/**
 * Génère un fichier ICS pour un événement
 */
function generateICS(
  orderCode: string,
  eventName: string,
  slotDate: string,
  startTime: string,
  endTime: string,
  address: string | null
): string {
  // Créer les objets Date pour le début et la fin
  const startDateTime = toZonedTime(
    new Date(`${slotDate}T${startTime}`),
    TIMEZONE
  )
  const endDateTime = toZonedTime(
    new Date(`${slotDate}T${endTime}`),
    TIMEZONE
  )

  // Date de création (maintenant)
  const now = new Date()
  const dtstamp = formatICSDate(now)

  // Dates de début et fin
  const dtstart = formatICSDate(startDateTime)
  const dtend = formatICSDate(endDateTime)

  // UID unique basé sur le code de commande
  const uid = `${orderCode}@pionniers-ecaussinnes.be`

  // Description et lieu
  const summary = `Retrait commande ${orderCode} - ${eventName}`
  const description = `Retrait de votre commande ${orderCode} pour ${eventName}.\\n\\nN'oubliez pas d'apporter votre confirmation par email ou le QR code.`
  const location = address || 'Adresse du retrait'

  // Générer le contenu ICS
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Scouts Ecaussinnes//Vente Multi-Événements//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Retrait commande scouts',
    'X-WR-TIMEZONE:Europe/Brussels',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=Europe/Brussels:${dtstart}`,
    `DTEND;TZID=Europe/Brussels:${dtend}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'DESCRIPTION:Rappel: Retrait dans 1 heure',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return ics
}

/**
 * GET /api/orders/[code]/ics
 * Génère et télécharge un fichier ICS pour un créneau de retrait
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    // Récupérer la commande avec son créneau
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        event:events(id, name, config),
        slot:slots(id, date, start_time, end_time)
      `)
      .eq('code', code)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    // Vérifier que c'est un retrait avec un créneau
    if (order.delivery_type !== 'PICKUP' || !order.slot) {
      return NextResponse.json(
        { error: 'Pas de créneau de retrait pour cette commande' },
        { status: 400 }
      )
    }

    // Récupérer l'adresse de retrait depuis la config de l'événement
    const pickupAddress = order.event?.config?.pickup_address || null

    // Générer le fichier ICS
    const icsContent = generateICS(
      order.code,
      order.event.name,
      order.slot.date,
      order.slot.start_time,
      order.slot.end_time,
      pickupAddress
    )

    // Retourner le fichier ICS
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="retrait-${order.code}.ics"`,
      },
    })
  } catch (error) {
    console.error('Erreur génération ICS:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
