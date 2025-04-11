// Database-specific types
export type ClueType = 'D' | 'E' | 'F' | 'I' | 'N' | 'E2';
export type ClueStatus = Record<ClueType, 'neutral' | 'grey' | 'red' | 'green'>;

export interface DbWord {
  id: string;
  word: string;
  definition: string;      // D: First hint (shown at start)
  etymology: string;       // E: Second hint
  first_letter: string;    // F: Third hint
  in_a_sentence: string;   // I: Fourth hint
  number_of_letters: number; // N: Fifth hint
  equivalents: string;     // E: Sixth hint
  difficulty: string;
  date?: string;          // The date this word is scheduled for
}

export interface User {
  id: string;
  username: string;
  created_at: string;
}

export interface DbUserStats {
  username: string;
  games_played: number;
  games_won: number;
  average_guesses: number;
  average_time: number;
  best_time: number;
  current_streak: number;
  longest_streak: number;
  top_ten_count: number;
  last_played_at: string;
}

export interface GameSession {
  id: string;
  word_id: string;
  word: string;
  start_time: string;
  end_time?: string;
  guesses: string[];
  guesses_used: number;
  revealed_clues: ClueType[];
  clue_status: ClueStatus;
  is_complete: boolean;
  is_won: boolean;
}

export interface DatabaseClient {
  // Connection methods
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  // Word operations
  getDailyWord(date?: string): Promise<DbWord | null>;
  
  // Game operations
  startGame(): Promise<GameSession>;
  processGuess(
    gameId: string, 
    guess: string, 
    session: GameSession
  ): Promise<{ 
    isCorrect: boolean; 
    gameOver: boolean; 
    updatedSession: GameSession;
  }>;
  getGameSession(gameId: string): Promise<GameSession | null>;
} 