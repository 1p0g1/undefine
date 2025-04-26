import { 
  ClueStatus,
  ClueType,
  DatabaseClient, 
  GameSession,
  GameState,
  GuessResult,
  User,
  UserStats,
  WordData,
  Result,
  LeaderboardEntry,
  StreakLeader as SharedStreakLeader
} from '../../../packages/shared-types/src/index.js';

// Create additional types locally to fix errors
interface DailyMetrics {
  totalGames: number;
  averageTime: number;
  averageGuesses: number;
  uniquePlayers: number;
  completionRate: number;
}

interface LocalLeaderboardEntry {
  id: string;
  username: string;
  wordId: string;
  word: string;
  timeTaken: number;
  guessesUsed: number;
  fuzzyMatches: number;
  hintsUsed: number;
  createdAt: string;
}

interface DailyLeaderboardResponse {
  entries: LocalLeaderboardEntry[];
  userRank: number;
}

/**
 * MockClient - A database client that returns pre-defined responses
 * for testing and development purposes.
 */
export class MockClient implements DatabaseClient {
  private connected = false;
  private words: WordData[] = [];
  private gameSessions: Record<string, GameSession> = {};
  private leaderboard: LocalLeaderboardEntry[] = [];
  private dailyMetrics: DailyMetrics = {
    totalGames: 0,
    averageTime: 0,
    averageGuesses: 0,
    uniquePlayers: 0,
    completionRate: 0
  };
  private streakLeaders: SharedStreakLeader[] = [];
  private users: Record<string, User> = {};

  constructor() {
    // Initialize with some mock data
  }

  async connect(): Promise<Result<void>> {
    this.connected = true;
    return { success: true };
  }

  async disconnect(): Promise<Result<void>> {
    this.connected = false;
    return { success: true };
  }

  async getRandomWord(): Promise<Result<WordData>> {
    if (this.words.length === 0) {
      return {
        success: false,
        error: {
          code: 'NO_WORDS',
          message: 'No words available'
        }
      };
    }
    const randomIndex = Math.floor(Math.random() * this.words.length);
    return {
      success: true,
      data: this.words[randomIndex]
    };
  }

  async getDailyWord(): Promise<Result<WordData>> {
    return this.getRandomWord();
  }

  async processGuess(
    gameId: string,
    guess: string,
    session: GameSession
  ): Promise<Result<GuessResult>> {
    const word = this.words.find(w => w.id === session.wordId);
    if (!word) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Word not found'
        }
      };
    }

    const isCorrect = guess.toLowerCase() === word.word.toLowerCase();
    const isFuzzy = false; // TODO: Implement fuzzy matching
    const fuzzyPositions: number[] = [];

    return {
      success: true,
      data: {
        isCorrect,
        guess,
        isFuzzy,
        fuzzyPositions,
        gameOver: isCorrect || session.guesses.length >= 6
      }
    };
  }

  async getLeaderboard(limit?: number): Promise<Result<LeaderboardEntry[]>> {
    return {
      success: true,
      data: this.leaderboard.slice(0, limit).map((entry, index) => ({
        username: entry.username,
        wordId: entry.wordId,
        word: entry.word,
        timeTaken: entry.timeTaken,
        guessesUsed: entry.guessesUsed,
        score: entry.timeTaken,
        rank: index + 1
      }))
    };
  }

  async getTopStreaks(limit?: number): Promise<Result<SharedStreakLeader[]>> {
    return {
      success: true,
      data: this.streakLeaders.slice(0, limit)
    };
  }

  async getNextHint(gameId: string): Promise<Result<string>> {
    const session = this.gameSessions[gameId];
    if (!session) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Game session not found'
        }
      };
    }

    const word = this.words.find(w => w.id === session.wordId);
    if (!word) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Word not found'
        }
      };
    }

    return {
      success: true,
      data: word.definition
    };
  }

  async submitScore(gameId: string, score: number): Promise<Result<void>> {
    const session = this.gameSessions[gameId];
    if (!session) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Game session not found'
        }
      };
    }

    session.score = score;
    return {
      success: true
    };
  }

  async createGameSession(wordId: string, word: string): Promise<GameSession> {
    const session: GameSession = {
      id: crypto.randomUUID(),
      userId: 'mock-user',
      wordId,
      word,
      startTime: new Date().toISOString(),
      guesses: [],
      hintsRevealed: [],
      completed: false,
      won: false
    };
    this.gameSessions[session.id] = session;
    return session;
  }

  async getUserStats(username: string): Promise<Result<UserStats | null>> {
    return {
      success: true,
      data: {
        username,
        gamesPlayed: 0,
        gamesWon: 0,
        averageGuesses: 0,
        averageTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastPlayedAt: new Date().toISOString()
      }
    };
  }

  async updateUserStats(username: string, won: boolean, guessesUsed: number, timeTaken: number): Promise<Result<void>> {
    return { success: true };
  }

  async getGameSession(gameId: string): Promise<Result<GameSession>> {
    const session = this.gameSessions[gameId];
    if (!session) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Game session not found'
        }
      };
    }
    return { success: true, data: session };
  }

  async startGame(): Promise<Result<GameSession>> {
    const word = await this.getRandomWord();
    if (!word.success || !word.data) {
      return {
        success: false,
        error: {
          code: 'NO_WORDS',
          message: 'No words available'
        }
      };
    }
    const session = await this.createGameSession(word.data.id, word.data.word);
    return { success: true, data: session };
  }

  async endGame(gameId: string, won: boolean): Promise<Result<void>> {
    const session = this.gameSessions[gameId];
    if (!session) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Game session not found'
        }
      };
    }
    session.completed = true;
    session.won = won;
    return { success: true };
  }

  async getClue(session: GameSession, clueType: ClueType): Promise<Result<string>> {
    const word = this.words.find(w => w.id === session.wordId);
    if (!word) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Word not found'
        }
      };
    }
    return { success: true, data: word.definition };
  }

  async getUserByUsername(username: string): Promise<Result<User | null>> {
    const user = Object.values(this.users).find(u => u.username === username);
    return { success: true, data: user || null };
  }

  async createUser(username: string): Promise<Result<User>> {
    const user: User = {
      id: crypto.randomUUID(),
      username,
      created_at: new Date().toISOString()
    };
    this.users[user.id] = user;
    return { success: true, data: user };
  }

  async addLeaderboardEntry(entry: LeaderboardEntry): Promise<Result<void>> {
    this.leaderboard.push({
      id: crypto.randomUUID(),
      username: entry.username,
      wordId: entry.wordId,
      word: entry.word,
      timeTaken: entry.timeTaken,
      guessesUsed: entry.guessesUsed,
      fuzzyMatches: 0,
      hintsUsed: 0,
      createdAt: new Date().toISOString()
    });
    return { success: true };
  }

  async markAsUsed(wordId: string): Promise<Result<void>> {
    return { success: true };
  }
} 