/**
 * Represents a word entry in the application
 */
export interface WordEntry {
  /** The word itself */
  word: string;
  /** The part of speech (noun, verb, etc.) */
  partOfSpeech: string;
  /** A list of synonyms for the word */
  synonyms?: string[];
  /** The primary definition of the word */
  definition: string;
  /** An optional alternate definition */
  alternateDefinition?: string;
  /** Date when this word will be the daily word (DD/MM/YY) */
  dateAdded: string;
  /** Letter count information */
  letterCount: {
    count: number;
    display: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents the form state for adding/editing a word
 */
export interface FormState {
  word: string;
  partOfSpeech: string;
  synonyms: string[];
  definition: string;
  alternateDefinition: string;
  dateAdded: string;
  letterCount: {
    count: number;
    display: string;
  };
}

/**
 * Represents a validation error for a form field
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Parameters for pagination
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Information about pagination
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Generic API response
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: PaginationInfo;
}

/**
 * Response for words API
 */
export interface WordsResponse {
  words: WordEntry[];
  pagination?: PaginationInfo;
}

/**
 * Query parameters for words API
 */
export interface WordsQueryParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
}

/**
 * Props for a table row component
 */
export interface TableRowProps {
  word: WordEntry;
  onEdit: (word: WordEntry) => void;
  onDelete: (word: WordEntry) => void;
  isSelected: boolean;
  toggleSelection: (word: WordEntry) => void;
  isSwipeable?: boolean;
}

/**
 * Props for the word form component
 */
export interface WordFormProps {
  initialData: FormState;
  onSubmit: (data: FormState) => Promise<void>;
  onCancel: () => void;
  isEditing: boolean;
}

/**
 * Props for the pagination component
 */
export interface PaginationProps {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  pageSizeOptions?: number[];
}

/**
 * Props for the search bar component
 */
export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  onClear?: () => void;
  debounceTime?: number;
  autoFocus?: boolean;
  clearable?: boolean;
}

/**
 * State for the admin panel
 */
export interface AdminPanelState {
  words: WordEntry[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  searchTerm: string;
  sortBy: string;
  sortDirection: SortDirection;
  selectedWords: WordEntry[];
  showDeleteConfirmation: boolean;
  isFormOpen: boolean;
  isEditing: boolean;
  currentWord: FormState;
  lastAddedWord: WordEntry | null;
}

/**
 * Type for form validation functions
 */
export type FormValidationFunction = (data: FormState) => ValidationError[];

/**
 * Sort direction (ascending or descending)
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Filter options for admin panel
 */
export type FilterOption = {
  id: string;
  label: string;
  value: string;
};

/**
 * Action types for reducers
 */
export enum ActionType {
  FETCH_WORDS_START = 'FETCH_WORDS_START',
  FETCH_WORDS_SUCCESS = 'FETCH_WORDS_SUCCESS',
  FETCH_WORDS_FAILURE = 'FETCH_WORDS_FAILURE',
  SET_SEARCH_TERM = 'SET_SEARCH_TERM',
  SET_SORT = 'SET_SORT',
  SELECT_WORD = 'SELECT_WORD',
  DESELECT_WORD = 'DESELECT_WORD',
  TOGGLE_SELECT_WORD = 'TOGGLE_SELECT_WORD',
  SELECT_ALL_WORDS = 'SELECT_ALL_WORDS',
  DESELECT_ALL_WORDS = 'DESELECT_ALL_WORDS',
  SHOW_DELETE_CONFIRMATION = 'SHOW_DELETE_CONFIRMATION',
  HIDE_DELETE_CONFIRMATION = 'HIDE_DELETE_CONFIRMATION',
  OPEN_FORM = 'OPEN_FORM',
  CLOSE_FORM = 'CLOSE_FORM',
  SET_CURRENT_WORD = 'SET_CURRENT_WORD',
  SET_LAST_ADDED_WORD = 'SET_LAST_ADDED_WORD',
  CLEAR_LAST_ADDED_WORD = 'CLEAR_LAST_ADDED_WORD',
}

/**
 * Props for keyboard shortcuts help modal
 */
export interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: {
    global?: Array<{ key: string; description: string }>;
    form?: Array<{ key: string; description: string }>;
    table?: Array<{ key: string; description: string }>;
  };
}

export interface WordQuery {
  word?: string;
  partOfSpeech?: string;
  definition?: string;
  limit?: number;
  offset?: number;
}

export interface WordResult {
  word: WordEntry;
  total: number;
}

export interface DailyStats {
  date: string;
  totalPlays: number;
  uniqueUsers: number;
  averageGuesses: number;
  averageTime: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  error?: string;
}

export interface LeaderboardEntry {
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

export interface DatabaseClient {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  // Word operations
  getWords(page: number, limit: number): Promise<WordEntry[]>;
  getWord(id: string): Promise<WordEntry | null>;
  addWord(word: Omit<WordEntry, 'id'>): Promise<WordEntry>;
  updateWord(id: string, word: Partial<WordEntry>): Promise<WordEntry>;
  deleteWord(id: string): Promise<boolean>;
  searchWords(query: string): Promise<WordEntry[]>;
  
  // Stats operations
  getDailyStats(): Promise<DailyStats>;
  
  // Authentication methods
  authenticateUser(credentials: UserCredentials): Promise<AuthResult>;
  getUserByEmail(email: string): Promise<User | null>;
  updateLastLogin(userId: string): Promise<void>;

  // Leaderboard operations
  addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id'>): Promise<LeaderboardEntry>;
  updateUserStats(username: string): Promise<void>;
}

// Server-specific types
export interface ServerConfig {
  port: number;
  env: string;
  dbProvider: string;
  redisUrl: string;
  jwtSecret: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
}

export interface CacheConfig {
  url: string;
  ttl: number;
  prefix: string;
} 