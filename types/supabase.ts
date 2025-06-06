export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          platform: string
          target_audience: string | null
          app_type: string | null
          color_scheme: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          platform: string
          target_audience?: string | null
          app_type?: string | null
          color_scheme?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          platform?: string
          target_audience?: string | null
          app_type?: string | null
          color_scheme?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          description: string | null
          thumbnail_url: string | null
          category: string
          platform: string
          is_premium: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          thumbnail_url?: string | null
          category: string
          platform: string
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          thumbnail_url?: string | null
          category?: string
          platform?: string
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      mockups: {
        Row: {
          id: string
          name: string
          project_id: string
          user_id: string
          template_id: string | null
          device_type: string
          background_color: string | null
          background_image_url: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          project_id: string
          user_id: string
          template_id?: string | null
          device_type: string
          background_color?: string | null
          background_image_url?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          project_id?: string
          user_id?: string
          template_id?: string | null
          device_type?: string
          background_color?: string | null
          background_image_url?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          name: string
          user_id: string
          project_id: string | null
          mockup_id: string | null
          file_url: string
          file_type: string
          width: number | null
          height: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          project_id?: string | null
          mockup_id?: string | null
          file_url: string
          file_type: string
          width?: number | null
          height?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          project_id?: string | null
          mockup_id?: string | null
          file_url?: string
          file_type?: string
          width?: number | null
          height?: number | null
          created_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: string
          status: string
          payment_reference: string | null
          is_annual: boolean
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: string
          status: string
          payment_reference?: string | null
          is_annual?: boolean
          current_period_start?: string
          current_period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: string
          status?: string
          payment_reference?: string | null
          is_annual?: boolean
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      api_metrics: {
        Row: {
          id: number
          api_name: string
          endpoint: string
          success: boolean
          status_code: number | null
          response_time_ms: number
          user_id: string | null
          request_id: string | null
          timestamp: string
        }
        Insert: {
          id?: number
          api_name: string
          endpoint: string
          success: boolean
          status_code?: number | null
          response_time_ms: number
          user_id?: string | null
          request_id?: string | null
          timestamp?: string
        }
        Update: {
          id?: number
          api_name?: string
          endpoint?: string
          success?: boolean
          status_code?: number | null
          response_time_ms?: number
          user_id?: string | null
          request_id?: string | null
          timestamp?: string
        }
      }
      api_error_logs: {
        Row: {
          id: number
          api_name: string
          endpoint: string
          error_message: string
          error_code: string | null
          status_code: number | null
          request_id: string | null
          user_id: string | null
          request_payload: Json | null
          raw_error: string | null
          timestamp: string
        }
        Insert: {
          id?: number
          api_name: string
          endpoint: string
          error_message: string
          error_code?: string | null
          status_code?: number | null
          request_id?: string | null
          user_id?: string | null
          request_payload?: Json | null
          raw_error?: string | null
          timestamp?: string
        }
        Update: {
          id?: number
          api_name?: string
          endpoint?: string
          error_message?: string
          error_code?: string | null
          status_code?: number | null
          request_id?: string | null
          user_id?: string | null
          request_payload?: Json | null
          raw_error?: string | null
          timestamp?: string
        }
      }
    }
  }
}
