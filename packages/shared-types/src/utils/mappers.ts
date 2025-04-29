import type { DBWord, DBUserStats, DBGameSession, DBLeaderboardEntry, DBStreakLeader, DBDailyMetrics } from '../types/db.js';
import type { GameWord, UserStats, GameSession, LeaderboardEntry, StreakLeader, DailyMetrics } from '../types/app.js';
import { normalizeEquivalents } from './word.js';
import type { WordData, WordClues } from '../types/core.js';

/**
 * Safely maps a DBWord to a GameWord, ensuring equivalents is always a string[]
 * @param dbWord The database word object
 * @returns A GameWord with normalized equivalents property
 */
export function mapDBWordToGameWord(dbWord: DBWord): GameWord {
  return {
    id: dbWord.id,
    word: dbWord.word,
    definition: dbWord.definition,
    etymology: dbWord.etymology,
    firstLetter: dbWord.first_letter,
    inASentence: dbWord.in_a_sentence,
    numberOfLetters: dbWord.number_of_letters,
    equivalents: normalizeEquivalents(dbWord.equivalents),
    difficulty: dbWord.difficulty,
    createdAt: dbWord.created_at,
    updatedAt: dbWord.updated_at
  };
}

export function mapDBUserStatsToUserStats(dbStats: DBUserStats): UserStats {
  return {
    username: dbStats.username,
    gamesPlayed: dbStats.games_played,
    gamesWon: dbStats.games_won,
    averageGuesses: dbStats.average_guesses,
    averageTime: dbStats.average_time,
    currentStreak: dbStats.current_streak,
    longestStreak: dbStats.longest_streak,
    lastPlayedAt: dbStats.last_played_at
  };
}

export function mapDBGameSessionToGameSession(dbSession: DBGameSession): GameSession {
  return {
    id: dbSession.id,
    userId: dbSession.user_id,
    wordId: dbSession.word_id,
    word: dbSession.word,
    words: dbSession.words ? mapDBWordToGameWord(dbSession.words) : undefined,
    wordSnapshot: dbSession.word_snapshot,
    startTime: dbSession.start_time,
    endTime: dbSession.end_time,
    guesses: dbSession.guesses,
    hintsRevealed: dbSession.hints_revealed,
    completed: dbSession.completed,
    won: dbSession.won,
    score: dbSession.score,
    guessesUsed: dbSession.guesses_used,
    revealedClues: dbSession.revealed_clues,
    isComplete: dbSession.is_complete,
    isWon: dbSession.is_won,
    state: dbSession.state
  };
}

export function mapDBLeaderboardEntryToLeaderboardEntry(dbEntry: DBLeaderboardEntry): LeaderboardEntry {
  return {
    username: dbEntry.username,
    score: dbEntry.score,
    rank: dbEntry.rank,
    wordId: dbEntry.word_id,
    word: dbEntry.word,
    timeTaken: dbEntry.time_taken,
    guessesUsed: dbEntry.guesses_used
  };
}

export function mapDBStreakLeaderToStreakLeader(dbLeader: DBStreakLeader): StreakLeader {
  return {
    username: dbLeader.username,
    currentStreak: dbLeader.current_streak,
    longestStreak: dbLeader.longest_streak,
    streak: dbLeader.streak
  };
}

export function mapDBDailyMetricsToDailyMetrics(dbMetrics: DBDailyMetrics): DailyMetrics {
  return {
    date: dbMetrics.date,
    totalGames: dbMetrics.total_games,
    totalWins: dbMetrics.total_wins,
    averageGuesses: dbMetrics.average_guesses,
    averageTime: dbMetrics.average_time
  };
}

/**
 * Maps a full WordData object to a WordClues object for frontend use.
 * This ensures we only pass the necessary clue data to the UI components.
 */
export const mapWordDataToWordClues = (data: WordData): WordClues => {
  return {
    D: data.definition,
    E: data.etymology,
    F: data.first_letter,
    I: data.in_a_sentence,
    N: data.number_of_letters,
    E2: data.equivalents || null
  };
};

/**
 * Type guard to check if an object is a valid WordClues object
 */
export const isWordClues = (obj: unknown): obj is WordClues => {
  if (!obj || typeof obj !== 'object') return false;
  
  const requiredFields: (keyof WordClues)[] = ['D', 'E', 'F', 'I', 'N', 'E2'];
  return requiredFields.every(field => field in obj);
}; 