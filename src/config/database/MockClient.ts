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
  LeaderboardEntry as SharedLeaderboardEntry,
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
    const word = this.words.find(w => w.id === session.word_id);
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

  async getLeaderboard(limit?: number): Promise<Result<SharedLeaderboardEntry[]>> {
    return {
      success: true,
      data: this.leaderboard.slice(0, limit).map((entry, index) => ({
        username: entry.username,
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

    const word = this.words.find(w => w.id === session.word_id);
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
      user_id: 'mock-user',
      word_id: wordId,
      word,
      start_time: new Date().toISOString(),
      guesses: [],
      hints_revealed: [],
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
        games_played: 0,
        games_won: 0,
        average_guesses: 0,
        average_time: 0,
        current_streak: 0,
        longest_streak: 0,
        last_played_at: new Date().toISOString()
      }
    };
  }
} 