// Re-export types from shared-types
import type {
  WordData,
  User,
  FormState,
  GameState,
  HintIndex,
  GuessResult,
  UserStats,
  GameSession,
  LeaderboardEntry,
  StreakLeader,
  WordClues,
  PaginationParams,
  PaginationInfo,
  ApiResponse,
  WordResponse,
  LeaderboardResponse,
  GameSessionResponse,
  UserStatsResponse,
  ErrorResponse,
  DailyWord,
  ValidationError
} from '@undefine/shared-types';
import { HINT_INDICES } from '@undefine/shared-types';

export type {
  WordData,
  User,
  FormState,
  GameState,
  HintIndex,
  GuessResult,
  UserStats,
  GameSession,
  LeaderboardEntry,
  StreakLeader,
  WordClues,
  HINT_INDICES,
  PaginationParams,
  PaginationInfo,
  ApiResponse,
  WordResponse,
  LeaderboardResponse,
  GameSessionResponse,
  UserStatsResponse,
  ErrorResponse,
  DailyWord,
  ValidationError
};

// Export UI types
export type {
  Theme,
  AnimationConfig,
  SoundConfig
} from './ui.js';

// Export game types
export type {
  GameConfig,
  GameStats,
  GameSettings
} from './game.js';

// Extend FormState with additional properties
export interface ExtendedFormState extends FormState {
  words: WordData[];
  isSubmitting: boolean;
  error: string | null;
} 