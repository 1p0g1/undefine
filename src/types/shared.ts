// Shared types for Un-Define game
export type ClueType = 'D' | 'E' | 'F' | 'I' | 'N' | 'E2';

export type ClueStatus = {
  [key in ClueType]: 'neutral' | 'grey' | 'correct' | 'incorrect';
};

export interface Word {
  id: string;
  word: string;
  definition: string;
  etymology?: string;
  first_letter: string;
  in_a_sentence?: string;
  number_of_letters: number;
  equivalents: string[];
  difficulty?: string;
  times_used?: number;
  last_used_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type GameState = 'active' | 'completed' | 'expired';

export interface GameSession {
  id: string;
  word_id: string;
  word: string;
  words?: Word;
  word_snapshot?: string;
  start_time: string;
  guesses: string[];
  guesses_used: number;
  revealed_clues: ClueType[];
  clue_status: ClueStatus;
  is_complete: boolean;
  is_won: boolean;
  end_time?: string;
  state: GameState;
  created_at?: string;
  updated_at?: string;
}

export interface GuessResult {
  isCorrect: boolean;
  guess: string;
  gameOver: boolean;
  correctWord?: string;
  nextHint?: {
    type: ClueType;
    hint: string;
  };
}

export interface Score {
  id: string;
  player_id: string;
  word: string;
  guesses_used: number;
  used_hint: boolean;
  completion_time_seconds: number;
  nickname?: string;
  created_at?: string;
}

export interface UserStats {
  username: string;
  games_played: number;
  games_won: number;
  average_guesses: number;
  average_time: number;
  current_streak: number;
  longest_streak: number;
  last_played_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  username: string;
  created_at: string;
}

export interface DatabaseClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getRandomWord(): Promise<Word>;
  getDailyWord(): Promise<Word>;
  processGuess(gameId: string, guess: string, session: GameSession): Promise<GuessResult>;
  getUserStats(username: string): Promise<UserStats | null>;
  updateUserStats(username: string, won: boolean, guessesUsed: number, timeTaken: number): Promise<void>;
  getGameSession(gameId: string): Promise<GameSession | null>;
  startGame(): Promise<GameSession>;
  endGame(gameId: string, won: boolean): Promise<void>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(username: string): Promise<User>;
  getClue(session: GameSession, clueType: ClueType): Promise<string | number | null>;
  getNextHint(session: GameSession): Promise<{ hint: string; type: ClueType }>;
  submitScore(score: {
    playerId: string;
    word: string;
    guessesUsed: number;
    usedHint: boolean;
    completionTime: number;
    nickname?: string;
  }): Promise<void>;
}

export interface WordClues {
  D: string; // Definition
  E: string; // Etymology
  F: string; // First letter
  I: string; // Example sentence (I for "In a sentence")
  N: number; // Number of letters
  E2: string[]; // Equivalents/Synonyms
}

export interface GameWord {
  id: string;
  word: string;
  definition: string;
  clues: WordClues;
}

export interface GameResponse {
  gameId: string;
  word: GameWord;
} 