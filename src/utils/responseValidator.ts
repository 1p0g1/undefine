import { ApiError } from '../middleware/errorHandler.js';
import type { 
  Word, 
  UserStats, 
  DailyMetrics, 
  LeaderboardEntry, 
  StreakLeader,
  GameSession
} from '@reversedefine/shared-types';

// Type guard functions to validate response shapes
export const isWord = (data: unknown): data is Word => {
  if (!data || typeof data !== 'object') return false;
  const word = data as Word;
  return (
    typeof word.word === 'string' &&
    typeof word.partOfSpeech === 'string' &&
    typeof word.definition === 'string' &&
    typeof word.dateAdded === 'string' &&
    typeof word.letterCount === 'object' &&
    word.letterCount !== null &&
    typeof word.letterCount.count === 'number' &&
    typeof word.letterCount.display === 'string' &&
    typeof word.createdAt === 'string' &&
    typeof word.updatedAt === 'string'
  );
};

export const isUserStats = (data: unknown): data is UserStats => {
  if (!data || typeof data !== 'object') return false;
  const stats = data as UserStats;
  return (
    typeof stats.username === 'string' &&
    typeof stats.gamesPlayed === 'number' &&
    typeof stats.gamesWon === 'number' &&
    typeof stats.averageGuesses === 'number' &&
    typeof stats.averageTime === 'number' &&
    typeof stats.bestTime === 'number' &&
    typeof stats.currentStreak === 'number' &&
    typeof stats.longestStreak === 'number'
  );
};

export const isDailyMetrics = (data: unknown): data is DailyMetrics => {
  if (!data || typeof data !== 'object') return false;
  const metrics = data as DailyMetrics;
  return (
    typeof metrics.date === 'string' &&
    typeof metrics.totalPlays === 'number' &&
    typeof metrics.uniqueUsers === 'number' &&
    typeof metrics.averageGuesses === 'number' &&
    typeof metrics.averageTime === 'number'
  );
};

export const isLeaderboardEntry = (data: unknown): data is LeaderboardEntry => {
  if (!data || typeof data !== 'object') return false;
  const entry = data as LeaderboardEntry;
  return (
    typeof entry.username === 'string' &&
    typeof entry.wordId === 'string' &&
    typeof entry.word === 'string' &&
    typeof entry.timeTaken === 'number' &&
    typeof entry.guessesUsed === 'number'
  );
};

export const isStreakLeader = (data: unknown): data is StreakLeader => {
  if (!data || typeof data !== 'object') return false;
  const leader = data as StreakLeader;
  return (
    typeof leader.username === 'string' &&
    typeof leader.streak === 'number'
  );
};

export const isGameSession = (data: unknown): data is GameSession => {
  if (!data || typeof data !== 'object') return false;
  const session = data as GameSession;
  return (
    typeof session.id === 'string' &&
    typeof session.wordId === 'string' &&
    typeof session.word === 'string' &&
    typeof session.startTime === 'string' &&
    typeof session.guessesUsed === 'number' &&
    typeof session.hintsUsed === 'number' &&
    typeof session.fuzzyMatches === 'number' &&
    typeof session.isComplete === 'boolean' &&
    typeof session.isWon === 'boolean'
  );
};

// Validation functions that throw errors if validation fails
export const validateWord = (data: unknown): Word => {
  if (!isWord(data)) {
    throw new ApiError(500, 'Invalid word data structure');
  }
  return data;
};

export const validateUserStats = (data: unknown): UserStats => {
  if (!isUserStats(data)) {
    throw new ApiError(500, 'Invalid user stats data structure');
  }
  return data;
};

export const validateDailyMetrics = (data: unknown): DailyMetrics => {
  if (!isDailyMetrics(data)) {
    throw new ApiError(500, 'Invalid daily metrics data structure');
  }
  return data;
};

export const validateLeaderboardEntry = (data: unknown): LeaderboardEntry => {
  if (!isLeaderboardEntry(data)) {
    throw new ApiError(500, 'Invalid leaderboard entry data structure');
  }
  return data;
};

export const validateStreakLeader = (data: unknown): StreakLeader => {
  if (!isStreakLeader(data)) {
    throw new ApiError(500, 'Invalid streak leader data structure');
  }
  return data;
};

export const validateGameSession = (data: unknown): GameSession => {
  if (!isGameSession(data)) {
    throw new ApiError(500, 'Invalid game session data structure');
  }
  return data;
}; 