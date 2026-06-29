export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      booking_item_addons: {
        Row: {
          addon_id: string
          booking_item_id: string
          created_at: string
          id: string
          price_cents: number
        }
        Insert: {
          addon_id: string
          booking_item_id: string
          created_at?: string
          id?: string
          price_cents: number
        }
        Update: {
          addon_id?: string
          booking_item_id?: string
          created_at?: string
          id?: string
          price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_item_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "service_addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_item_addons_booking_item_id_fkey"
            columns: ["booking_item_id"]
            isOneToOne: false
            referencedRelation: "booking_items"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_items: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          price_cents: number
          resource_id: string | null
          service_id: string
          staff_id: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          price_cents: number
          resource_id?: string | null
          service_id: string
          staff_id?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          price_cents?: number
          resource_id?: string | null
          service_id?: string
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_number: string
          booking_source: Database["public"]["Enums"]["booking_source"]
          created_at: string
          duration_minutes: number
          family_member_id: string | null
          guest_email: string
          guest_id: string
          guest_name: string
          guest_phone: string | null
          id: string
          notes: string | null
          order_id: string | null
          revenue_model: Database["public"]["Enums"]["revenue_model"]
          scheduled_at: string
          status: Database["public"]["Enums"]["booking_status"]
          tip_cents: number
          total_cents: number
          updated_at: string
          voucher_discount_cents: number | null
        }
        Insert: {
          booking_number: string
          booking_source?: Database["public"]["Enums"]["booking_source"]
          created_at?: string
          duration_minutes: number
          family_member_id?: string | null
          guest_email: string
          guest_id: string
          guest_name: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          revenue_model?: Database["public"]["Enums"]["revenue_model"]
          scheduled_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          tip_cents?: number
          total_cents: number
          updated_at?: string
          voucher_discount_cents?: number | null
        }
        Update: {
          booking_number?: string
          booking_source?: Database["public"]["Enums"]["booking_source"]
          created_at?: string
          duration_minutes?: number
          family_member_id?: string | null
          guest_email?: string
          guest_id?: string
          guest_name?: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          revenue_model?: Database["public"]["Enums"]["revenue_model"]
          scheduled_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          tip_cents?: number
          total_cents?: number
          updated_at?: string
          voucher_discount_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          birthday: string | null
          city: string | null
          company: string | null
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          last_contact_date: string | null
          notes: string | null
          phone: string | null
          position: string | null
          status: Database["public"]["Enums"]["contact_status"]
          tags: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          birthday?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name: string
          id?: string
          last_contact_date?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          birthday?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          last_contact_date?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      event_log: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      family_members: {
        Row: {
          created_at: string
          date_of_birth: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          primary_account_id: string
          relationship: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          primary_account_id: string
          relationship?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          primary_account_id?: string
          relationship?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          customer_email: string
          customer_id: string
          customer_name: string
          id: string
          invoice_number: string
          order_id: string
          paid: boolean
          paid_at: string | null
          subtotal_cents: number
          tax_cents: number
          total_cents: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_id: string
          customer_name: string
          id?: string
          invoice_number: string
          order_id: string
          paid?: boolean
          paid_at?: string | null
          subtotal_cents: number
          tax_cents?: number
          total_cents: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_id?: string
          customer_name?: string
          id?: string
          invoice_number?: string
          order_id?: string
          paid?: boolean
          paid_at?: string | null
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          lead_id: string
          scheduled_at: string | null
          subject: string
          type: Database["public"]["Enums"]["activity_type"]
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          lead_id: string
          scheduled_at?: string | null
          subject: string
          type: Database["public"]["Enums"]["activity_type"]
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          lead_id?: string
          scheduled_at?: string | null
          subject?: string
          type?: Database["public"]["Enums"]["activity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          expected_close_date: string | null
          id: string
          probability: number | null
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          title: string
          updated_at: string
          value_cents: number | null
        }
        Insert: {
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          probability?: number | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          title: string
          updated_at?: string
          value_cents?: number | null
        }
        Update: {
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          probability?: number | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          title?: string
          updated_at?: string
          value_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_accounts: {
        Row: {
          created_at: string
          id: string
          lifetime_points: number
          points_balance: number
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lifetime_points?: number
          points_balance?: number
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lifetime_points?: number
          points_balance?: number
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          account_id: string
          booking_id: string | null
          created_at: string
          description: string
          id: string
          points: number
        }
        Insert: {
          account_id: string
          booking_id?: string | null
          created_at?: string
          description: string
          id?: string
          points: number
        }
        Update: {
          account_id?: string
          booking_id?: string | null
          created_at?: string
          description?: string
          id?: string
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "loyalty_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_cents: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price_cents: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_cents?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          booking_id: string | null
          created_at: string
          customer_email: string
          customer_id: string
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          order_number: string
          order_type: string
          package_discount_cents: number
          package_discount_percent: number
          shipping_address: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          tax_cents: number
          tip_cents: number
          total_cents: number
          updated_at: string
          voucher_discount_cents: number | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          customer_email: string
          customer_id: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number: string
          order_type?: string
          package_discount_cents?: number
          package_discount_percent?: number
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          tax_cents?: number
          tip_cents?: number
          total_cents: number
          updated_at?: string
          voucher_discount_cents?: number | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          customer_email?: string
          customer_id?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          order_type?: string
          package_discount_cents?: number
          package_discount_percent?: number
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents?: number
          tax_cents?: number
          tip_cents?: number
          total_cents?: number
          updated_at?: string
          voucher_discount_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price_cents: number
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price_cents: number
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price_cents?: number
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          capacity: number
          created_at: string
          id: string
          is_active: boolean
          name: string
          type: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          type: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          type?: string
        }
        Relationships: []
      }
      service_addons: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price_cents: number
          service_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price_cents: number
          service_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_addons_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_required_skills: {
        Row: {
          created_at: string
          id: string
          service_id: string
          skill: string
        }
        Insert: {
          created_at?: string
          id?: string
          service_id: string
          skill: string
        }
        Update: {
          created_at?: string
          id?: string
          service_id?: string
          skill?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_required_skills_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          price_cents: number
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean
          name: string
          price_cents: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          commission_rate: number | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          rental_fee_cents: number | null
          specialty: string | null
          user_id: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          rental_fee_cents?: number | null
          specialty?: string | null
          user_id?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          rental_fee_cents?: number | null
          specialty?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_availability: {
        Row: {
          created_at: string
          end_time: string
          id: string
          staff_id: string
          start_time: string
          updated_at: string
          weekday: number
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          staff_id: string
          start_time: string
          updated_at?: string
          weekday: number
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          staff_id?: string
          start_time?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "staff_availability_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_skills: {
        Row: {
          created_at: string
          id: string
          skill: string
          staff_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          skill: string
          staff_id: string
        }
        Update: {
          created_at?: string
          id?: string
          skill?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_skills_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_time_off: {
        Row: {
          all_day: boolean
          created_at: string
          date: string
          end_time: string | null
          id: string
          notes: string | null
          staff_id: string
          start_time: string | null
          type: Database["public"]["Enums"]["time_off_type"]
          updated_at: string
        }
        Insert: {
          all_day?: boolean
          created_at?: string
          date: string
          end_time?: string | null
          id?: string
          notes?: string | null
          staff_id: string
          start_time?: string | null
          type: Database["public"]["Enums"]["time_off_type"]
          updated_at?: string
        }
        Update: {
          all_day?: boolean
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          staff_id?: string
          start_time?: string | null
          type?: Database["public"]["Enums"]["time_off_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_time_off_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      subcontractor_payouts: {
        Row: {
          amount_to_business_cents: number
          amount_to_subcontractor_cents: number
          booking_id: string
          created_at: string
          id: string
          paid: boolean
          paid_at: string | null
          revenue_model: Database["public"]["Enums"]["revenue_model"]
          service_price_cents: number
          staff_id: string
        }
        Insert: {
          amount_to_business_cents: number
          amount_to_subcontractor_cents: number
          booking_id: string
          created_at?: string
          id?: string
          paid?: boolean
          paid_at?: string | null
          revenue_model: Database["public"]["Enums"]["revenue_model"]
          service_price_cents: number
          staff_id: string
        }
        Update: {
          amount_to_business_cents?: number
          amount_to_subcontractor_cents?: number
          booking_id?: string
          created_at?: string
          id?: string
          paid?: boolean
          paid_at?: string | null
          revenue_model?: Database["public"]["Enums"]["revenue_model"]
          service_price_cents?: number
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcontractor_payouts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subcontractor_payouts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voucher_redemptions: {
        Row: {
          amount_cents: number
          booking_id: string | null
          created_at: string
          id: string
          order_id: string | null
          redeemed_by: string
          voucher_id: string
        }
        Insert: {
          amount_cents: number
          booking_id?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          redeemed_by: string
          voucher_id: string
        }
        Update: {
          amount_cents?: number
          booking_id?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          redeemed_by?: string
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voucher_redemptions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_redemptions_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_redemptions_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      vouchers: {
        Row: {
          balance_cents: number
          code: string
          created_at: string
          id: string
          message: string | null
          purchaser_id: string | null
          recipient_email: string | null
          recipient_name: string | null
          redeemed_at: string | null
          redeemed_by: string | null
          status: Database["public"]["Enums"]["voucher_status"]
          updated_at: string
          valid_from: string
          valid_until: string
          value_cents: number
          voucher_type: Database["public"]["Enums"]["voucher_type"]
        }
        Insert: {
          balance_cents: number
          code: string
          created_at?: string
          id?: string
          message?: string | null
          purchaser_id?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: Database["public"]["Enums"]["voucher_status"]
          updated_at?: string
          valid_from?: string
          valid_until: string
          value_cents: number
          voucher_type: Database["public"]["Enums"]["voucher_type"]
        }
        Update: {
          balance_cents?: number
          code?: string
          created_at?: string
          id?: string
          message?: string | null
          purchaser_id?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: Database["public"]["Enums"]["voucher_status"]
          updated_at?: string
          valid_from?: string
          valid_until?: string
          value_cents?: number
          voucher_type?: Database["public"]["Enums"]["voucher_type"]
        }
        Relationships: [
          {
            foreignKeyName: "vouchers_purchaser_id_fkey"
            columns: ["purchaser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vouchers_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_booking_number: { Args: never; Returns: string }
      generate_invoice_number: { Args: never; Returns: string }
      generate_order_number: { Args: never; Returns: string }
      generate_voucher_code: { Args: never; Returns: string }
      get_staff_financials: {
        Args: never
        Returns: {
          commission_rate: number
          id: string
          name: string
          rental_fee_cents: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      redeem_voucher: {
        Args: {
          _amount_cents: number
          _booking_id?: string
          _order_id?: string
          _voucher_code: string
        }
        Returns: Json
      }
      set_demo_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: undefined
      }
    }
    Enums: {
      activity_type:
        | "call"
        | "email"
        | "meeting"
        | "note"
        | "task"
        | "follow_up"
      app_role:
        | "guest"
        | "group_host"
        | "corp_admin"
        | "frontdesk"
        | "provider"
        | "restaurant"
        | "manager"
        | "owner"
        | "admin"
      booking_source: "platform" | "private" | "internal"
      booking_status:
        | "pending"
        | "confirmed"
        | "checked_in"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      contact_status: "active" | "inactive" | "vip" | "blacklisted"
      lead_source:
        | "website"
        | "referral"
        | "social_media"
        | "walk_in"
        | "phone"
        | "email"
        | "event"
        | "other"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      product_category:
        | "skincare"
        | "haircare"
        | "wellness"
        | "tools"
        | "gift_sets"
        | "breakfast"
        | "lunch"
        | "dinner"
        | "beverages"
        | "desserts"
      revenue_model: "commission" | "rental"
      service_category:
        | "spa"
        | "kids_salon"
        | "barber"
        | "restaurant"
        | "braids"
        | "blowout"
        | "treatment"
        | "needlework"
        | "adult_salon"
        | "lash_bar"
        | "kids_spa"
        | "kids_hydro"
      time_off_type: "day_off" | "private_booking" | "vacation" | "sick"
      voucher_status: "active" | "redeemed" | "expired" | "cancelled"
      voucher_type: "gift_certificate" | "discount" | "service_credit"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: ["call", "email", "meeting", "note", "task", "follow_up"],
      app_role: [
        "guest",
        "group_host",
        "corp_admin",
        "frontdesk",
        "provider",
        "restaurant",
        "manager",
        "owner",
        "admin",
      ],
      booking_source: ["platform", "private", "internal"],
      booking_status: [
        "pending",
        "confirmed",
        "checked_in",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      contact_status: ["active", "inactive", "vip", "blacklisted"],
      lead_source: [
        "website",
        "referral",
        "social_media",
        "walk_in",
        "phone",
        "email",
        "event",
        "other",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      product_category: [
        "skincare",
        "haircare",
        "wellness",
        "tools",
        "gift_sets",
        "breakfast",
        "lunch",
        "dinner",
        "beverages",
        "desserts",
      ],
      revenue_model: ["commission", "rental"],
      service_category: [
        "spa",
        "kids_salon",
        "barber",
        "restaurant",
        "braids",
        "blowout",
        "treatment",
        "needlework",
        "adult_salon",
        "lash_bar",
        "kids_spa",
        "kids_hydro",
      ],
      time_off_type: ["day_off", "private_booking", "vacation", "sick"],
      voucher_status: ["active", "redeemed", "expired", "cancelled"],
      voucher_type: ["gift_certificate", "discount", "service_credit"],
    },
  },
} as const
