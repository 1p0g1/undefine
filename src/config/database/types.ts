export interface Word {
  id: string;
  word: string;
  partOfSpeech: string;
  definition: string;
  alternateDefinition?: string;
  dateAdded: string;
}

export interface WordQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface WordResult {
  words: Word[];
  total: number;
  page: number;
  limit: number;
}

export interface DailyStats {
  date: string;
  totalGames: number;
  averageTime: number;
  averageGuesses: number;
  uniquePlayers: number;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  user: Omit<User, 'passwordHash'>;
  token: string;
}

export interface DatabaseClient {
  // Word operations
  getWords(query: WordQuery): Promise<WordResult>;
  getWord(id: string): Promise<Word | null>;
  addWord(word: Omit<Word, 'id'>): Promise<Word>;
  updateWord(id: string, word: Partial<Word>): Promise<Word>;
  deleteWord(id: string): Promise<boolean>;
  searchWords(query: string): Promise<Word[]>;

  // Stats operations
  getDailyStats(): Promise<DailyStats>;
  addGameStats(stats: {
    time: number;
    guessCount: number;
    fuzzyCount: number;
    hintCount: number;
    word: string;
  }): Promise<void>;

  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  // Authentication methods
  authenticateUser(credentials: UserCredentials): Promise<AuthResult>;
  getUserByEmail(email: string): Promise<User | null>;
  updateLastLogin(userId: string): Promise<void>;
} 