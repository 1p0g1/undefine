// Database-specific types
export type ClueType = 'D' | 'E' | 'F' | 'I' | 'N' | 'E2';
export type ClueStatus = Record<ClueType, 'grey' | 'red' | 'green' | 'neutral'>;

export interface DbWord {
  id: string;
  word: string;
  definition: string;      // D: First hint (shown at start)
  etymology: string | null;      // E: Second hint
  first_letter: string | null;   // F: Third hint
  in_a_sentence: string | null;  // I: Fourth hint
  number_of_letters: number | null; // N: Fifth hint
  equivalents: string | null;    // E2: Sixth hint
  difficulty: string | null;     // Optional difficulty rating
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

export interface GuessResult {
  isCorrect: boolean;
  correctWord: string;
  guessedWord: string;
  isFuzzy: boolean;
  fuzzyPositions?: number[];
  leaderboardRank?: number;
  gameOver: boolean;
  updatedSession: GameSession;
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
  checkGuess(wordId: string, guess: string): Promise<boolean>;
} 