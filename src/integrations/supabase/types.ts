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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          charger_id: string
          created_at: string
          duration_minutes: number
          end_time: string
          estimated_cost: number
          estimated_energy_kwh: number
          id: string
          start_time: string
          station_id: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          charger_id: string
          created_at?: string
          duration_minutes: number
          end_time: string
          estimated_cost?: number
          estimated_energy_kwh?: number
          id?: string
          start_time: string
          station_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          charger_id?: string
          created_at?: string
          duration_minutes?: number
          end_time?: string
          estimated_cost?: number
          estimated_energy_kwh?: number
          id?: string
          start_time?: string
          station_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_charger_id_fkey"
            columns: ["charger_id"]
            isOneToOne: false
            referencedRelation: "chargers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      chargers: {
        Row: {
          charger_type: Database["public"]["Enums"]["charger_type"]
          created_at: string
          id: string
          label: string
          power_kw: number
          price_per_kwh: number
          station_id: string
          status: Database["public"]["Enums"]["charger_status"]
          updated_at: string
        }
        Insert: {
          charger_type?: Database["public"]["Enums"]["charger_type"]
          created_at?: string
          id?: string
          label: string
          power_kw?: number
          price_per_kwh?: number
          station_id: string
          status?: Database["public"]["Enums"]["charger_status"]
          updated_at?: string
        }
        Update: {
          charger_type?: Database["public"]["Enums"]["charger_type"]
          created_at?: string
          id?: string
          label?: string
          power_kw?: number
          price_per_kwh?: number
          station_id?: string
          status?: Database["public"]["Enums"]["charger_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chargers_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      charging_sessions: {
        Row: {
          booking_id: string
          charger_id: string
          cost: number
          created_at: string
          current_battery: number
          ended_at: string | null
          energy_kwh: number
          id: string
          start_battery: number
          started_at: string
          station_id: string
          status: Database["public"]["Enums"]["session_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id: string
          charger_id: string
          cost?: number
          created_at?: string
          current_battery?: number
          ended_at?: string | null
          energy_kwh?: number
          id?: string
          start_battery?: number
          started_at?: string
          station_id: string
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string
          charger_id?: string
          cost?: number
          created_at?: string
          current_battery?: number
          ended_at?: string | null
          energy_kwh?: number
          id?: string
          start_battery?: number
          started_at?: string
          station_id?: string
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "charging_sessions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charging_sessions_charger_id_fkey"
            columns: ["charger_id"]
            isOneToOne: false
            referencedRelation: "chargers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charging_sessions_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          created_at: string
          id: string
          message: string
          station_id: string | null
          status: Database["public"]["Enums"]["complaint_status"]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          station_id?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          station_id?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          created_at: string
          energy_kwh: number
          id: string
          method: string
          paid_at: string | null
          rate_per_kwh: number
          service_fee: number
          session_id: string
          station_id: string
          status: Database["public"]["Enums"]["payment_status"]
          total_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          energy_kwh?: number
          id?: string
          method?: string
          paid_at?: string | null
          rate_per_kwh?: number
          service_fee?: number
          session_id: string
          station_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          total_amount?: number
          user_id: string
        }
        Update: {
          created_at?: string
          energy_kwh?: number
          id?: string
          method?: string
          paid_at?: string | null
          rate_per_kwh?: number
          service_fee?: number
          session_id?: string
          station_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "charging_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          preferred_charger_type:
            | Database["public"]["Enums"]["charger_type"]
            | null
          target_battery_level: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id: string
          name?: string
          phone?: string | null
          preferred_charger_type?:
            | Database["public"]["Enums"]["charger_type"]
            | null
          target_battery_level?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          preferred_charger_type?:
            | Database["public"]["Enums"]["charger_type"]
            | null
          target_battery_level?: number
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          station_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          station_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          station_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_stations: {
        Row: {
          created_at: string
          station_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          station_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          station_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_stations_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      stations: {
        Row: {
          address: string
          amenities: string[]
          city: string
          closing_time: string
          created_at: string
          id: string
          image_url: string | null
          is_24x7: boolean
          latitude: number
          longitude: number
          name: string
          opening_time: string
          owner_id: string | null
          rating: number
          review_count: number
          status: Database["public"]["Enums"]["station_status"]
          updated_at: string
        }
        Insert: {
          address: string
          amenities?: string[]
          city?: string
          closing_time?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_24x7?: boolean
          latitude: number
          longitude: number
          name: string
          opening_time?: string
          owner_id?: string | null
          rating?: number
          review_count?: number
          status?: Database["public"]["Enums"]["station_status"]
          updated_at?: string
        }
        Update: {
          address?: string
          amenities?: string[]
          city?: string
          closing_time?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_24x7?: boolean
          latitude?: number
          longitude?: number
          name?: string
          opening_time?: string
          owner_id?: string | null
          rating?: number
          review_count?: number
          status?: Database["public"]["Enums"]["station_status"]
          updated_at?: string
        }
        Relationships: []
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
      vehicles: {
        Row: {
          battery_capacity_kwh: number
          created_at: string
          current_battery_level: number
          id: string
          is_primary: boolean
          make: string
          model: string
          registration_no: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          battery_capacity_kwh?: number
          created_at?: string
          current_battery_level?: number
          id?: string
          is_primary?: boolean
          make: string
          model: string
          registration_no?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          battery_capacity_kwh?: number
          created_at?: string
          current_battery_level?: number
          id?: string
          is_primary?: boolean
          make?: string
          model?: string
          registration_no?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_station: {
        Args: { _station_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "ev_user" | "station_owner" | "admin"
      booking_status: "confirmed" | "active" | "completed" | "cancelled"
      charger_status: "available" | "in_use" | "disabled" | "maintenance"
      charger_type: "dc_fast" | "ac"
      complaint_status: "open" | "in_review" | "resolved"
      payment_status: "pending" | "paid" | "failed"
      session_status: "active" | "completed"
      station_status: "pending" | "approved" | "rejected"
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
      app_role: ["ev_user", "station_owner", "admin"],
      booking_status: ["confirmed", "active", "completed", "cancelled"],
      charger_status: ["available", "in_use", "disabled", "maintenance"],
      charger_type: ["dc_fast", "ac"],
      complaint_status: ["open", "in_review", "resolved"],
      payment_status: ["pending", "paid", "failed"],
      session_status: ["active", "completed"],
      station_status: ["pending", "approved", "rejected"],
    },
  },
} as const
