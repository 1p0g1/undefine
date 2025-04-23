// Database types with snake_case fields
export interface DBWord {
  id: string;
  word: string;
  definition: string;
  etymology: string | null;
  first_letter: string;
  in_a_sentence: string | null;
  number_of_letters: number;
  equivalents: string[];
  difficulty: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface DBUserStats {
  username: string;
  games_played: number;
  games_won: number;
  average_guesses: number;
  average_time: number;
  current_streak: number;
  longest_streak: number;
  last_played_at: string;
}

export interface DBGameSession {
  id: string;
  user_id: string;
  word_id: string;
  word: string;
  words?: DBWord;
  word_snapshot?: string;
  start_time: string;
  end_time?: string;
  guesses: string[];
  hints_revealed: number[];
  completed: boolean;
  won: boolean;
  score?: number;
  guesses_used?: number;
  revealed_clues?: number[];
  is_complete?: boolean;
  is_won?: boolean;
  state?: string;
}

export interface DBLeaderboardEntry {
  username: string;
  score: number;
  rank: number;
  word_id: string;
  word: string;
  time_taken: number;
  guesses_used: number;
}

export interface DBStreakLeader {
  username: string;
  current_streak: number;
  longest_streak: number;
  streak: number;
}

export interface DBDailyMetrics {
  date: string;
  total_games: number;
  total_wins: number;
  average_guesses: number;
  average_time: number;
} 