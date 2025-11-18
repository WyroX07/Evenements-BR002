import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

interface ICSEventOptions {
  uid: string
  summary: string
  description: string
  location: string
  startDateTime: Date
  endDateTime: Date
  organizerName?: string
  organizerEmail?: string
}

/**
 * Génère un fichier ICS (iCalendar) pour un événement
 * @param options Options de l'événement
 * @returns Contenu du fichier ICS au format texte
 */
export function generateICS(options: ICSEventOptions): string {
  const {
    uid,
    summary,
    description,
    location,
    startDateTime,
    endDateTime,
    organizerName = 'Les Pionniers d\'Ecaussinnes',
    organizerEmail = 'contact@pionniers-ecaussinnes.be',
  } = options

  const timezone = 'Europe/Brussels'

  // Conversion en timezone Europe/Brussels
  const start = toZonedTime(startDateTime, timezone)
  const end = toZonedTime(endDateTime, timezone)

  // Format ICS: YYYYMMDDTHHmmss
  const formatICSDate = (date: Date): string => {
    return format(date, "yyyyMMdd'T'HHmmss")
  }

  const now = new Date()
  const dtstamp = formatICSDate(now)
  const dtstart = formatICSDate(start)
  const dtend = formatICSDate(end)

  // Échappement des caractères spéciaux pour ICS
  const escapeICS = (str: string): string => {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pionniers Ecaussinnes//Vente Crémant//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-TIMEZONE:Europe/Brussels',
    'BEGIN:VEVENT',
    `UID:${escapeICS(uid)}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICS(summary)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    `LOCATION:${escapeICS(location)}`,
    `ORGANIZER;CN=${escapeICS(organizerName)}:mailto:${organizerEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Rappel: Retrait crémant dans 1 heure',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return icsContent
}

/**
 * Génère un ICS pour un retrait de commande
 * @param orderCode Code de la commande
 * @param customerName Nom du client
 * @param slotDate Date du créneau
 * @param slotStartTime Heure de début (format "HH:mm")
 * @param pickupAddress Adresse de retrait
 * @returns Contenu ICS
 */
export function generatePickupICS(
  orderCode: string,
  customerName: string,
  slotDate: string,
  slotStartTime: string,
  pickupAddress: string
): string {
  // Parse la date et l'heure
  const [hours, minutes] = slotStartTime.split(':').map(Number)
  const startDateTime = new Date(slotDate)
  startDateTime.setHours(hours, minutes, 0, 0)

  // Durée par défaut: 15 minutes
  const endDateTime = new Date(startDateTime)
  endDateTime.setMinutes(endDateTime.getMinutes() + 15)

  return generateICS({
    uid: `${orderCode}@cremant-pionniers.be`,
    summary: 'Retrait commande crémant',
    description: `Retrait de votre commande ${orderCode} - ${customerName}. N'oubliez pas d'apporter ce rappel ou le QR code de confirmation.`,
    location: pickupAddress,
    startDateTime,
    endDateTime,
    organizerName: 'Les Pionniers d\'Ecaussinnes',
    organizerEmail: 'contact@pionniers-ecaussinnes.be',
  })
}
