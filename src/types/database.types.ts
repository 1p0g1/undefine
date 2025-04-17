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
      words: {
        Row: {
          id: string
          word: string
          definition: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          word: string
          definition?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          word?: string
          definition?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string
          score: number
          duration: number
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          score?: number
          duration?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          duration?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          total_games: number
          total_score: number
          average_score: number
          highest_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_games?: number
          total_score?: number
          average_score?: number
          highest_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_games?: number
          total_score?: number
          average_score?: number
          highest_score?: number
          created_at?: string
          updated_at?: string
        }
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
  }
} 