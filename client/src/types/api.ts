import type { WordData, GuessResult, UserStats, GameSession, LeaderboardEntry } from '@undefine/shared-types';

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type WordResponse = ApiResponse<WordData>;
export type GuessResponse = ApiResponse<GuessResult>;
export type UserStatsResponse = ApiResponse<UserStats>;
export type GameSessionResponse = ApiResponse<GameSession>;
export type LeaderboardResponse = ApiResponse<LeaderboardEntry[]>;
export type ErrorResponse = ApiResponse<never>;

export interface ApiEndpoints {
  '/api/word': {
    GET: {
      response: ApiResponse<WordData>;
    };
  };
  '/api/guess': {
    POST: {
      body: {
        gameId: string;
        guess: string;
      };
      response: ApiResponse<GuessResult>;
    };
  };
  '/api/stats': {
    GET: {
      response: ApiResponse<UserStats>;
    };
  };
  '/api/session': {
    GET: {
      response: ApiResponse<GameSession>;
    };
  };
}

export interface GuessRequest {
  gameId: string;
  guess: string;
}

export interface GameResponse {
  id: string;
  word: WordData;
  guesses: string[];
  hintsRevealed: number[];
  isComplete: boolean;
  isWon: boolean;
}

export interface StatsResponse {
  totalGames: number;
  wins: number;
  losses: number;
  averageGuesses: number;
  bestStreak: number;
  currentStreak: number;
} 