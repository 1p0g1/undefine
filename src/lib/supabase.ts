import { createClient } from '@supabase/supabase-js'

// Basic Database type definition since we don't have access to the generated types
interface Database {
  public: {
    Tables: {
      words: {
        Row: Record<string, any>;
      };
      game_sessions: {
        Row: Record<string, any>;
      };
      user_stats: {
        Row: Record<string, any>;
      };
    };
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type Tables = Database['public']['Tables']
export type WordRow = Tables['words']['Row']
export type GameSessionRow = Tables['game_sessions']['Row']
export type UserStatsRow = Tables['user_stats']['Row'] 