/**
 * Represents a word entry in the application
 */
export interface WordEntry {
  /** The word itself */
  word: string;
  /** The part of speech (noun, verb, etc.) */
  partOfSpeech: string;
  /** A list of synonyms for the word */
  synonyms: string[];
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
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
  onPageSizeChange?: (pageSize: number) => void;
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