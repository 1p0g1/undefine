// Local type definitions
export interface Word {
  id: string;
  word: string;
  definition: string;
  part_of_speech: string;
  difficulty?: number;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt?: string;
}

export interface GameSession {
  id: string;
  userId: string;
  wordId: string;
  startTime: string;
  endTime?: string;
  guesses: number;
  completed: boolean;
  score?: number;
}

export interface GuessResult {
  correct: boolean;
  similarity?: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  rank?: number;
}

export interface UserStats {
  totalGames: number;
  gamesWon: number;
  averageGuesses: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DatabaseClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

// Client-specific types
export interface WordEntry {
  id: string;
  word: string;
  definition: string;
  difficulty: number;
  part_of_speech: string;
}

export interface WordData {
  id: string;
  word: string;
  clues: {
    D: string;  // Definition
    E: string;  // Etymology
    F: string;  // First letter
    I: string;  // In a sentence
    N: number;  // Number of letters
    E2: string[];  // Equivalents/synonyms
  };
}

export interface FormState {
  isSubmitting: boolean;
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface WordsResponse {
  words: WordEntry[];
  pagination?: PaginationInfo;
}

// Query parameters for API operations
export interface WordsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: keyof WordEntry;
  sortDirection?: 'asc' | 'desc';
  filterBy?: Partial<Record<keyof WordEntry, string>>;
}

// Component props types
export interface TableRowProps {
  word: WordEntry;
  index: number;
  onEdit: (word: WordEntry) => void;
  onDelete: (word: WordEntry) => void;
  isSelected: boolean;
  onSelect: (word: WordEntry) => void;
}

export interface WordFormProps {
  initialData: FormState;
  onSubmit: (data: FormState) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  pageSizeOptions?: number[];
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

// Application state interfaces
export interface AdminPanelState {
  words: WordEntry[];
  loading: boolean;
  error: string | null;
  selectedWord: WordEntry | null;
  selectedWords: WordEntry[];
  isEditing: boolean;
  isAdding: boolean;
  formData: FormState;
  pagination: PaginationInfo | null;
  search: string;
}

// Form validation types
export type FormValidationFunction = (data: FormState) => ValidationError[];

// Sort direction type
export type SortDirection = 'asc' | 'desc';

// Filter options type
export interface FilterOption {
  field: keyof WordEntry;
  value: string;
  label: string;
}

// Export enum for action types (useful for reducers)
export enum ActionType {
  FETCH_WORDS_START = 'FETCH_WORDS_START',
  FETCH_WORDS_SUCCESS = 'FETCH_WORDS_SUCCESS',
  FETCH_WORDS_FAILURE = 'FETCH_WORDS_FAILURE',
  SET_SELECTED_WORD = 'SET_SELECTED_WORD',
  TOGGLE_SELECTED_WORD = 'TOGGLE_SELECTED_WORD',
  SET_SELECTED_WORDS = 'SET_SELECTED_WORDS',
  SET_IS_EDITING = 'SET_IS_EDITING',
  SET_IS_ADDING = 'SET_IS_ADDING',
  SET_FORM_DATA = 'SET_FORM_DATA',
  UPDATE_FORM_FIELD = 'UPDATE_FORM_FIELD',
  SET_PAGINATION = 'SET_PAGINATION',
  SET_SEARCH = 'SET_SEARCH',
  SET_SORT = 'SET_SORT',
  SET_FILTER = 'SET_FILTER',
  RESET_STATE = 'RESET_STATE',
}

export interface GameState {
  currentWord: string;
  guesses: string[];
  hints: string[];
  isComplete: boolean;
  startTime: Date;
  endTime?: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  sound: boolean;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  averageGuesses: number;
  fastestTime: number;
  longestStreak: number;
}

export type ClueType = 'D' | 'E' | 'F' | 'I' | 'N' | 'E2';

// Client-specific GuessResult that extends the shared type
export interface ClientGuessResult extends GuessResult {
  isCorrect: boolean;
  guess: string;
  isFuzzy: boolean;
  fuzzyPositions?: number[];
  gameOver: boolean;
  correctWord: string;
}

// Add the API response type that matches the Supabase schema
export interface ApiWord {
  id: string;
  word: string;
  definition: string;
  etymology: string;
  first_letter: string;
  in_a_sentence: string;
  number_of_letters: number;
  equivalents: string[];
  difficulty: string;
}

// Game types
export interface GuessHistory {
  word: string;
  isCorrect: boolean;
  isFuzzy: boolean;
}

export type HintType = 'D' | 'E' | 'F' | 'I' | 'N' | 'E2';

export interface Hint {
  D: boolean;  // Definition (always revealed)
  E: boolean;  // Etymology
  F: boolean;  // First letter
  I: boolean;  // In a sentence
  N: boolean;  // Number of letters
  E2: boolean; // Equivalents (synonyms)
}

export interface Message {
  text: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

// Constants
export const HINT_INDICES: Record<ClueType, number> = {
  D: 0,  // Definition (always revealed)
  E: 1,  // Etymology
  F: 2,  // First Letter
  I: 3,  // In a Sentence
  N: 4,  // Number of Letters
  E2: 5, // Equivalents/Synonyms
};

// Export all types needed by the client application
export interface WordResponse {
  word: string;
  definition: string;
  part_of_speech: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  pagination?: PaginationInfo;
}

export interface GameSessionResponse {
  session: GameSession;
}

export interface UserStatsResponse {
  stats: UserStats;
}

export interface ErrorResponse {
  error: string;
}

export interface DailyWord {
  id: string;
  word: string;
  definition: string;
  part_of_speech: string;
  date: string;
}

// Re-export game-specific types
export * from './game'; 