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
export declare const supabase: import("@supabase/supabase-js").SupabaseClient<Database, "public", any>;
export type Tables = Database['public']['Tables'];
export type WordRow = Tables['words']['Row'];
export type GameSessionRow = Tables['game_sessions']['Row'];
export type UserStatsRow = Tables['user_stats']['Row'];
export {};
//# sourceMappingURL=supabase.d.ts.map