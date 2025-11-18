/**
 * Types générés pour la base de données Supabase
 * Correspond au schéma SQL défini dans supabase/sql/
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cuvees: {
        Row: {
          id: string
          name: string
          description: string | null
          price_cents: number
          is_active: boolean
          stock: number | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price_cents: number
          is_active?: boolean
          stock?: number | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price_cents?: number
          is_active?: boolean
          stock?: number | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      slots: {
        Row: {
          id: string
          date: string
          start_time: string
          end_time: string
          capacity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          start_time: string
          end_time: string
          capacity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
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
          code: string
          created_at: string
          updated_at: string
          status: 'PENDING' | 'PAID' | 'PREPARED' | 'DELIVERED' | 'CANCELLED'
          customer_name: string
          email: string
          phone: string
          delivery_type: 'PICKUP' | 'DELIVERY'
          slot_id: string | null
          address: string | null
          city: string | null
          zip: string | null
          subtotal_cents: number
          discount_cents: number
          delivery_fee_cents: number
          total_cents: number
          payment_method: 'BANK_TRANSFER' | 'ON_SITE' | 'PAY_LINK'
          notes: string | null
          bank_reference: string | null
          admin_internal_note: string | null
        }
        Insert: {
          id?: string
          code: string
          created_at?: string
          updated_at?: string
          status?: 'PENDING' | 'PAID' | 'PREPARED' | 'DELIVERED' | 'CANCELLED'
          customer_name: string
          email: string
          phone: string
          delivery_type: 'PICKUP' | 'DELIVERY'
          slot_id?: string | null
          address?: string | null
          city?: string | null
          zip?: string | null
          subtotal_cents: number
          discount_cents: number
          delivery_fee_cents: number
          total_cents: number
          payment_method: 'BANK_TRANSFER' | 'ON_SITE' | 'PAY_LINK'
          notes?: string | null
          bank_reference?: string | null
          admin_internal_note?: string | null
        }
        Update: {
          id?: string
          code?: string
          created_at?: string
          updated_at?: string
          status?: 'PENDING' | 'PAID' | 'PREPARED' | 'DELIVERED' | 'CANCELLED'
          customer_name?: string
          email?: string
          phone?: string
          delivery_type?: 'PICKUP' | 'DELIVERY'
          slot_id?: string | null
          address?: string | null
          city?: string | null
          zip?: string | null
          subtotal_cents?: number
          discount_cents?: number
          delivery_fee_cents?: number
          total_cents?: number
          payment_method?: 'BANK_TRANSFER' | 'ON_SITE' | 'PAY_LINK'
          notes?: string | null
          bank_reference?: string | null
          admin_internal_note?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          cuvee_id: string | null
          qty: number
          unit_price_cents: number
          line_total_cents: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          cuvee_id?: string | null
          qty: number
          unit_price_cents: number
          line_total_cents: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          cuvee_id?: string | null
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
          order_id: string | null
          action: string
          meta: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          action: string
          meta?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
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
