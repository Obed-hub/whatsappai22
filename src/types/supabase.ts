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
      vendors: {
        Row: {
          id: string
          email: string
          business_name: string | null
          phone: string | null
          plan: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          business_name?: string | null
          phone?: string | null
          plan?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          business_name?: string | null
          phone?: string | null
          plan?: string
          created_at?: string
          updated_at?: string
        }
      }
      stores: {
        Row: {
          id: string
          vendor_id: string
          store_name: string
          slug: string
          logo_url: string | null
          primary_color: string
          description: string | null
          delivery_info: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          store_name: string
          slug: string
          logo_url?: string | null
          primary_color?: string
          description?: string | null
          delivery_info?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          store_name?: string
          slug?: string
          logo_url?: string | null
          primary_color?: string
          description?: string | null
          delivery_info?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          vendor_id: string
          store_id: string
          name: string
          slug: string
          price: number
          stock: number
          description: string | null
          images: string[]
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          store_id: string
          name: string
          slug: string
          price: number
          stock?: number
          description?: string | null
          images?: string[]
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          store_id?: string
          name?: string
          slug?: string
          price?: number
          stock?: number
          description?: string | null
          images?: string[]
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          vendor_id: string
          phone: string
          name: string | null
          tags: string[]
          last_seen_at: string
          consent_json: Json
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          phone: string
          name?: string | null
          tags?: string[]
          last_seen_at?: string
          consent_json?: Json
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          phone?: string
          name?: string | null
          tags?: string[]
          last_seen_at?: string
          consent_json?: Json
          created_at?: string
        }
      }
      automations: {
        Row: {
          vendor_id: string
          auto_reply_enabled: boolean
          ai_enabled: boolean
          followup_enabled: boolean
          welcome_message: string | null
          reminder_1: number
          reminder_2: number
          reminder_3: number
          created_at: string
          updated_at: string
        }
        Insert: {
          vendor_id: string
          auto_reply_enabled?: boolean
          ai_enabled?: boolean
          followup_enabled?: boolean
          welcome_message?: string | null
          reminder_1?: number
          reminder_2?: number
          reminder_3?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          vendor_id?: string
          auto_reply_enabled?: boolean
          ai_enabled?: boolean
          followup_enabled?: boolean
          welcome_message?: string | null
          reminder_1?: number
          reminder_2?: number
          reminder_3?: number
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          vendor_id: string
          customer_id: string
          phone_number_id: string
          last_user_message_at: string
          window_open_until: string
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          customer_id: string
          phone_number_id: string
          last_user_message_at?: string
          window_open_until?: string
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          customer_id?: string
          phone_number_id?: string
          last_user_message_at?: string
          window_open_until?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          vendor_id: string
          direction: 'inbound' | 'outbound'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          vendor_id: string
          direction: 'inbound' | 'outbound'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          vendor_id?: string
          direction?: 'inbound' | 'outbound'
          content?: string
          created_at?: string
        }
      }
      whatsapp_connections: {
        Row: {
          id: string
          vendor_id: string
          phone_number_id: string
          access_token: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          phone_number_id: string
          access_token: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          phone_number_id?: string
          access_token?: string
          status?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          vendor_id: string
          store_id: string
          customer_id: string
          status: string
          total_amount: number
          currency: string
          shipping_address: string | null
          customer_details: Json
          payment_reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          store_id: string
          customer_id: string
          status?: string
          total_amount: number
          currency?: string
          shipping_address?: string | null
          customer_details: Json
          payment_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          store_id?: string
          customer_id?: string
          status?: string
          total_amount?: number
          currency?: string
          shipping_address?: string | null
          customer_details?: Json
          payment_reference?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          created_at?: string
        }
      }
    }
  }
}
