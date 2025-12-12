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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_number_masked: string | null
          connection_id: string
          created_at: string | null
          currency: string | null
          id: string
          is_primary: boolean | null
          user_id: string
        }
        Insert: {
          account_name: string
          account_number_masked?: string | null
          connection_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          is_primary?: boolean | null
          user_id: string
        }
        Update: {
          account_name?: string
          account_number_masked?: string | null
          connection_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          is_primary?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "bank_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_connections: {
        Row: {
          consent_expires_at: string | null
          created_at: string | null
          id: string
          institution_logo: string | null
          institution_name: string
          last_sync_at: string | null
          provider: string
          status: Database["public"]["Enums"]["connection_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          consent_expires_at?: string | null
          created_at?: string | null
          id?: string
          institution_logo?: string | null
          institution_name: string
          last_sync_at?: string | null
          provider: string
          status?: Database["public"]["Enums"]["connection_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          consent_expires_at?: string | null
          created_at?: string | null
          id?: string
          institution_logo?: string | null
          institution_name?: string
          last_sync_at?: string | null
          provider?: string
          status?: Database["public"]["Enums"]["connection_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      broker_accounts: {
        Row: {
          account_number: string | null
          broker_name: string
          cash_balance: number | null
          created_at: string | null
          currency: string | null
          id: string
          kyc_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          broker_name?: string
          cash_balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          kyc_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          broker_name?: string
          cash_balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          kyc_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      excluded_merchants: {
        Row: {
          created_at: string | null
          id: string
          merchant_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          merchant_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          merchant_name?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          executed_at: string | null
          id: string
          instrument_name: string
          instrument_symbol: string
          quantity: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          sweep_run_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          executed_at?: string | null
          id?: string
          instrument_name: string
          instrument_symbol: string
          quantity?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          sweep_run_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          executed_at?: string | null
          id?: string
          instrument_name?: string
          instrument_symbol?: string
          quantity?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          sweep_run_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_sweep_run_id_fkey"
            columns: ["sweep_run_id"]
            isOneToOne: false
            referencedRelation: "sweep_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          average_cost: number
          currency: string | null
          current_value: number | null
          id: string
          instrument_name: string
          instrument_symbol: string
          quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_cost: number
          currency?: string | null
          current_value?: number | null
          id?: string
          instrument_name: string
          instrument_symbol: string
          quantity: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_cost?: number
          currency?: string | null
          current_value?: number | null
          id?: string
          instrument_name?: string
          instrument_symbol?: string
          quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          kyc_completed: boolean | null
          onboarding_completed: boolean | null
          region: Database["public"]["Enums"]["region_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          kyc_completed?: boolean | null
          onboarding_completed?: boolean | null
          region?: Database["public"]["Enums"]["region_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          kyc_completed?: boolean | null
          onboarding_completed?: boolean | null
          region?: Database["public"]["Enums"]["region_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      roundup_ledger: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          is_reversal: boolean | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          is_reversal?: boolean | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          is_reversal?: boolean | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roundup_ledger_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      sweep_runs: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          error_message: string | null
          executed_at: string | null
          id: string
          scheduled_at: string
          status: Database["public"]["Enums"]["sweep_status"] | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          scheduled_at: string
          status?: Database["public"]["Enums"]["sweep_status"] | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["sweep_status"] | null
          user_id?: string
        }
        Relationships: []
      }
      sweep_settings: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          minimum_threshold: number | null
          monthly_cap: number | null
          risk_profile: Database["public"]["Enums"]["risk_profile"] | null
          sweep_day: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_threshold?: number | null
          monthly_cap?: number | null
          risk_profile?: Database["public"]["Enums"]["risk_profile"] | null
          sweep_day?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_threshold?: number | null
          monthly_cap?: number | null
          risk_profile?: Database["public"]["Enums"]["risk_profile"] | null
          sweep_day?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category: string | null
          created_at: string | null
          currency: string | null
          external_id: string | null
          id: string
          is_eligible_for_roundup: boolean | null
          is_excluded: boolean | null
          merchant_name: string | null
          transaction_date: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category?: string | null
          created_at?: string | null
          currency?: string | null
          external_id?: string | null
          id?: string
          is_eligible_for_roundup?: boolean | null
          is_excluded?: boolean | null
          merchant_name?: string | null
          transaction_date: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category?: string | null
          created_at?: string | null
          currency?: string | null
          external_id?: string | null
          id?: string
          is_eligible_for_roundup?: boolean | null
          is_excluded?: boolean | null
          merchant_name?: string | null
          transaction_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
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
      connection_status: "active" | "pending" | "expired" | "error"
      order_status: "pending" | "executed" | "failed" | "cancelled"
      region_type: "eu" | "ch"
      risk_profile: "conservative" | "balanced" | "growth"
      sweep_status: "pending" | "processing" | "completed" | "failed"
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
      connection_status: ["active", "pending", "expired", "error"],
      order_status: ["pending", "executed", "failed", "cancelled"],
      region_type: ["eu", "ch"],
      risk_profile: ["conservative", "balanced", "growth"],
      sweep_status: ["pending", "processing", "completed", "failed"],
    },
  },
} as const
