/**
 * Types générés pour la base de données Supabase - VERSION 2 Multi-Événements
 * Correspond au schéma SQL défini dans supabase/sql/*_v2.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type EventType = 'PRODUCT_SALE' | 'MEAL' | 'RAFFLE'
export type EventStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED'
export type ProductType = 'ITEM' | 'MENU' | 'TICKET'
export type OrderStatus = 'PENDING' | 'PAID' | 'PREPARED' | 'DELIVERED' | 'CANCELLED'
export type DeliveryType = 'PICKUP' | 'DELIVERY' | 'ON_SITE'
export type PaymentMethod = 'BANK_TRANSFER' | 'ON_SITE' | 'PAY_LINK'

// Configuration du Hero (landing page)
export interface HeroConfig {
  title: string
  subtitle?: string
  description: string
  banner_url?: string | null
  show_deadline: boolean
  show_stats: boolean
  features: string[]
  cta_text: string
}

// Configuration par événement
export interface EventConfig {
  delivery_enabled?: boolean
  delivery_min_bottles?: number
  delivery_fee_cents?: number
  allowed_zip_codes?: string[]
  discount_10for9?: boolean
  pickup_address?: string
  pay_link_url?: string
  order_code_prefix?: string
}

export interface Database {
  public: {
    Tables: {
      sections: {
        Row: {
          id: string
          name: string
          slug: string
          color: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          color?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          color?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          slug: string
          section_id: string
          event_type: EventType
          status: EventStatus
          name: string
          description: string | null
          start_date: string
          end_date: string
          hero_config: HeroConfig
          config: EventConfig
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          section_id: string
          event_type: EventType
          status?: EventStatus
          name: string
          description?: string | null
          start_date: string
          end_date: string
          hero_config?: HeroConfig
          config?: EventConfig
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          section_id?: string
          event_type?: EventType
          status?: EventStatus
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string
          hero_config?: HeroConfig
          config?: EventConfig
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          event_id: string
          name: string
          description: string | null
          price_cents: number
          product_type: ProductType
          stock: number | null
          is_active: boolean
          sort_order: number
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          description?: string | null
          price_cents: number
          product_type?: ProductType
          stock?: number | null
          is_active?: boolean
          sort_order?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          description?: string | null
          price_cents?: number
          product_type?: ProductType
          stock?: number | null
          is_active?: boolean
          sort_order?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      slots: {
        Row: {
          id: string
          event_id: string
          date: string
          start_time: string
          end_time: string
          capacity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          date: string
          start_time: string
          end_time: string
          capacity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          date?: string
          start_time?: string
          end_time?: string
          capacity?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          event_id: string
          code: string
          created_at: string
          updated_at: string
          status: OrderStatus
          customer_name: string
          email: string
          phone: string
          delivery_type: DeliveryType
          slot_id: string | null
          address: string | null
          city: string | null
          zip: string | null
          subtotal_cents: number
          discount_cents: number
          delivery_fee_cents: number
          total_cents: number
          payment_method: PaymentMethod
          notes: string | null
          bank_reference: string | null
          admin_internal_note: string | null
          rgpd_consent: boolean
        }
        Insert: {
          id?: string
          event_id: string
          code: string
          created_at?: string
          updated_at?: string
          status?: OrderStatus
          customer_name: string
          email: string
          phone: string
          delivery_type: DeliveryType
          slot_id?: string | null
          address?: string | null
          city?: string | null
          zip?: string | null
          subtotal_cents: number
          discount_cents: number
          delivery_fee_cents: number
          total_cents: number
          payment_method: PaymentMethod
          notes?: string | null
          bank_reference?: string | null
          admin_internal_note?: string | null
          rgpd_consent?: boolean
        }
        Update: {
          id?: string
          event_id?: string
          code?: string
          created_at?: string
          updated_at?: string
          status?: OrderStatus
          customer_name?: string
          email?: string
          phone?: string
          delivery_type?: DeliveryType
          slot_id?: string | null
          address?: string | null
          city?: string | null
          zip?: string | null
          subtotal_cents?: number
          discount_cents?: number
          delivery_fee_cents?: number
          total_cents?: number
          payment_method?: PaymentMethod
          notes?: string | null
          bank_reference?: string | null
          admin_internal_note?: string | null
          rgpd_consent?: boolean
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          qty: number
          unit_price_cents: number
          line_total_cents: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          qty: number
          unit_price_cents: number
          line_total_cents: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          qty?: number
          unit_price_cents?: number
          line_total_cents?: number
          created_at?: string
        }
      }
      settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          event_id: string | null
          order_id: string | null
          action: string
          meta: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id?: string | null
          order_id?: string | null
          action: string
          meta?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string | null
          order_id?: string | null
          action?: string
          meta?: Json | null
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
