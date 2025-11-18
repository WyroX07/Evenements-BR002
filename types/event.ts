/**
 * Types pour les événements et leur configuration hero enrichie
 */

export interface Section {
  id: string
  name: string
  slug: string
  color: string
  iban: string
  iban_name: string
}

export interface Product {
  id: string
  name: string
  description: string
  price_cents: number
  product_type: string
  stock: number | null
  is_active: boolean
  sort_order: number
}

export interface Slot {
  id: string
  date: string
  start_time: string
  end_time: string
  capacity: number
  bookedCount?: number
  remainingCapacity?: number
  isFull?: boolean
}

/**
 * Proposition de valeur pour la section "Pourquoi commander"
 */
export interface ValueProposition {
  icon: 'quality' | 'price' | 'support' | 'delivery' | 'eco' | 'local' | 'custom'
  custom_icon?: string  // Emoji ou classe Lucide si icon = 'custom'
  title: string
  description: string
}

/**
 * Section À propos du partenaire/producteur
 */
export interface AboutSection {
  enabled: boolean
  title: string
  content: string
  image_url?: string
  link?: {
    url: string
    label: string
  }
}

/**
 * Section médias (photos/vidéo)
 */
export interface MediaSection {
  type: 'gallery' | 'video' | 'both'
  title?: string
  gallery_images?: string[]
  video_url?: string  // URL YouTube/Vimeo embed
  video_thumbnail?: string
}

/**
 * Question/Réponse pour la FAQ
 */
export interface FAQItem {
  question: string
  answer: string
}

/**
 * Liens réseaux sociaux et externes
 */
export interface SocialLinks {
  facebook_event?: string
  instagram?: string
  twitter?: string
  custom_links?: Array<{
    label: string
    url: string
    icon?: string  // Emoji ou classe Lucide
  }>
}

/**
 * Témoignage client (optionnel)
 */
export interface Testimonial {
  name: string
  text: string
  role?: string
  avatar_url?: string
}

/**
 * Configuration Hero enrichie (modulable et tout optionnel sauf l'essentiel)
 */
export interface HeroConfig {
  // 🔴 ESSENTIELS (obligatoires)
  title: string
  cta_text: string

  // 🟡 RECOMMANDÉS (améliorent l'expérience)
  subtitle?: string
  description?: string
  banner_url?: string | null
  features?: string[]  // Badges rapides (ex: "Remise 10 pour 9")

  // 🟢 AFFICHAGE
  show_deadline?: boolean
  show_stats?: boolean

  // 🆕 SECTIONS OPTIONNELLES ENRICHIES
  value_propositions?: ValueProposition[]
  about_section?: AboutSection
  media?: MediaSection
  faq?: FAQItem[]
  social_links?: SocialLinks
  testimonials?: Testimonial[]

  // 🎨 CUSTOMISATION DESIGN (pour plus tard)
  theme?: {
    primary_color?: string  // Override de la couleur de section
    background_image?: string
    text_color?: 'light' | 'dark'
  }
}

/**
 * Configuration générale de l'événement
 */
export interface EventConfig {
  delivery_enabled: boolean
  delivery_min_bottles?: number
  delivery_fee_cents?: number
  discount_10for9?: boolean
  pickup_address?: string
  allowed_zip_codes?: string[]
  order_code_prefix?: string
}

/**
 * Événement complet
 */
export interface Event {
  id: string
  slug: string
  name: string
  description: string
  event_type: 'PRODUCT_SALE' | 'MEAL' | 'RAFFLE'
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED'
  start_date: string
  end_date: string
  section: Section
  hero_config: HeroConfig
  config: EventConfig
  products?: Product[]
  slots?: Slot[]
  stats?: {
    totalOrders: number
    productsCount?: number
    slotsCount?: number
    totalRevenueCents?: number
  }
}

export interface EventResponse {
  event: Event
}

export interface EventsResponse {
  events: Event[]
}
