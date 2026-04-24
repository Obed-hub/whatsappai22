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
          popularity_score: number
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
          first_message: string | null
          last_message: string | null
          last_intent: string | null
          last_intent_at: string | null
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
      followups: {
        Row: {
          id: string
          vendor_id: string
          customer_id: string
          conversation_id: string | null
          type: 'soft' | 'urgent' | 'reminder_1h' | 'reminder_24h'
          scheduled_at: string
          sent_at: string | null
          cancelled_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          customer_id: string
          conversation_id?: string | null
          type: 'soft' | 'urgent' | 'reminder_1h' | 'reminder_24h'
          scheduled_at: string
          sent_at?: string | null
          cancelled_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          customer_id?: string
          conversation_id?: string | null
          type?: 'soft' | 'urgent' | 'reminder_1h' | 'reminder_24h'
          scheduled_at?: string
          sent_at?: string | null
          cancelled_at?: string | null
          created_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          vendor_id: string
          customer_id: string | null
          type: string
          message: string
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          customer_id?: string | null
          type: string
          message: string
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          customer_id?: string | null
          type?: string
          message?: string
          sent_at?: string | null
          created_at?: string
        }
      }
      interests: {
        Row: {
          id: string
          customer_id: string
          vendor_id: string
          product_id: string | null
          intent_score: number
          intent_type: string | null
          raw_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          vendor_id: string
          product_id?: string | null
          intent_score?: number
          intent_type?: string | null
          raw_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          vendor_id?: string
          product_id?: string | null
          intent_score?: number
          intent_type?: string | null
          raw_message?: string | null
          created_at?: string
        }
      }
      back_in_stock_requests: {
        Row: {
          id: string
          vendor_id: string
          customer_id: string
          product_id: string
          status: 'pending' | 'notified' | 'cancelled'
          notified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          customer_id: string
          product_id: string
          status?: 'pending' | 'notified' | 'cancelled'
          notified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          customer_id?: string
          product_id?: string
          status?: 'pending' | 'notified' | 'cancelled'
          notified_at?: string | null
          created_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          vendor_id: string
          event_type: string
          customer_id: string | null
          metadata_json: Json
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          event_type: string
          customer_id?: string | null
          metadata_json?: Json
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          event_type?: string
          customer_id?: string | null
          metadata_json?: Json
          created_at?: string
        }
      }
      button_clicks: {
        Row: {
          id: string
          vendor_id: string
          customer_id: string | null
          button_type: string
          target_url: string
          clicked_at: string
          source: string | null
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          customer_id?: string | null
          button_type: string
          target_url: string
          clicked_at?: string
          source?: string | null
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          customer_id?: string | null
          button_type?: string
          target_url?: string
          clicked_at?: string
          source?: string | null
          session_id?: string | null
          created_at?: string
        }
      }
      store_visits: {
        Row: {
          id: string
          vendor_id: string
          customer_id: string | null
          source: string | null
          ref: string | null
          visited_at: string
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          customer_id?: string | null
          source?: string | null
          ref?: string | null
          visited_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          customer_id?: string | null
          source?: string | null
          ref?: string | null
          visited_at?: string
          created_at?: string
        }
      }
    }
  }
}
