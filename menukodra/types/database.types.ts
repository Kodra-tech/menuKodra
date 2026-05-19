export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          available_from: string | null
          available_until: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string | null
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id?: string | null
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      item_modifier_groups: {
        Row: {
          group_id: string
          item_id: string
        }
        Insert: {
          group_id: string
          item_id: string
        }
        Update: {
          group_id?: string
          item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_modifier_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "modifier_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_modifier_groups_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergens: string[] | null
          category_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          prep_time_minutes: number | null
          price: number
          restaurant_id: string | null
          tags: string[] | null
        }
        Insert: {
          allergens?: string[] | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          prep_time_minutes?: number | null
          price: number
          restaurant_id?: string | null
          tags?: string[] | null
        }
        Update: {
          allergens?: string[] | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          prep_time_minutes?: number | null
          price?: number
          restaurant_id?: string | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      modifier_groups: {
        Row: {
          id: string
          is_required: boolean | null
          max_select: number | null
          min_select: number | null
          name: string
          restaurant_id: string | null
          type: string | null
        }
        Insert: {
          id?: string
          is_required?: boolean | null
          max_select?: number | null
          min_select?: number | null
          name: string
          restaurant_id?: string | null
          type?: string | null
        }
        Update: {
          id?: string
          is_required?: boolean | null
          max_select?: number | null
          min_select?: number | null
          name?: string
          restaurant_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modifier_groups_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      modifier_options: {
        Row: {
          display_order: number | null
          group_id: string | null
          id: string
          name: string
          price_delta: number | null
        }
        Insert: {
          display_order?: number | null
          group_id?: string | null
          id?: string
          name: string
          price_delta?: number | null
        }
        Update: {
          display_order?: number | null
          group_id?: string | null
          id?: string
          name?: string
          price_delta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "modifier_options_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "modifier_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          menu_item_id: string | null
          modifiers: Json | null
          name_snapshot: string
          order_id: string | null
          price_snapshot: number
          quantity: number
          special_instructions: string | null
          subtotal: number
        }
        Insert: {
          id?: string
          menu_item_id?: string | null
          modifiers?: Json | null
          name_snapshot: string
          order_id?: string | null
          price_snapshot: number
          quantity?: number
          special_instructions?: string | null
          subtotal: number
        }
        Update: {
          id?: string
          menu_item_id?: string | null
          modifiers?: Json | null
          name_snapshot?: string
          order_id?: string | null
          price_snapshot?: number
          quantity?: number
          special_instructions?: string | null
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          restaurant_id: string | null
          session_id: string | null
          status: string | null
          subtotal: number
          table_id: string | null
          total: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          restaurant_id?: string | null
          session_id?: string | null
          status?: string | null
          subtotal: number
          table_id?: string | null
          total: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          restaurant_id?: string | null
          session_id?: string | null
          status?: string | null
          subtotal?: number
          table_id?: string | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "table_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          customer_email: string | null
          external_id: string | null
          id: string
          method: string | null
          paid_at: string | null
          restaurant_id: string | null
          session_id: string | null
          status: string | null
          tip: number | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_email?: string | null
          external_id?: string | null
          id?: string
          method?: string | null
          paid_at?: string | null
          restaurant_id?: string | null
          session_id?: string | null
          status?: string | null
          tip?: number | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_email?: string | null
          external_id?: string | null
          id?: string
          method?: string | null
          paid_at?: string | null
          restaurant_id?: string | null
          session_id?: string | null
          status?: string | null
          tip?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "table_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          created_at: string | null
          currency: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          plan: string | null
          primary_color: string | null
          rfc: string | null
          slug: string
          timezone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          plan?: string | null
          primary_color?: string | null
          rfc?: string | null
          slug: string
          timezone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          plan?: string | null
          primary_color?: string | null
          rfc?: string | null
          slug?: string
          timezone?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string | null
          id: string
          name: string
          restaurant_id: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          restaurant_id?: string | null
          role: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          restaurant_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      table_sessions: {
        Row: {
          closed_at: string | null
          id: string
          opened_at: string | null
          restaurant_id: string | null
          status: string | null
          table_id: string | null
          total: number | null
        }
        Insert: {
          closed_at?: string | null
          id?: string
          opened_at?: string | null
          restaurant_id?: string | null
          status?: string | null
          table_id?: string | null
          total?: number | null
        }
        Update: {
          closed_at?: string | null
          id?: string
          opened_at?: string | null
          restaurant_id?: string | null
          status?: string | null
          table_id?: string | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "table_sessions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_sessions_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          label: string | null
          number: number
          qr_code_url: string | null
          restaurant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          number: number
          qr_code_url?: string | null
          restaurant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          number?: number
          qr_code_url?: string | null
          restaurant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      waiter_calls: {
        Row: {
          created_at: string | null
          id: string
          restaurant_id: string
          session_id: string
          status: string | null
          table_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          restaurant_id: string
          session_id: string
          status?: string | null
          table_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          restaurant_id?: string
          session_id?: string
          status?: string | null
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waiter_calls_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiter_calls_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "table_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiter_calls_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
