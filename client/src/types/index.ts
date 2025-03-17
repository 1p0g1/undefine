// Word-related types
export interface WordEntry {
  word: string;
  partOfSpeech: string;
  synonyms?: string[];
  definition: string;
  alternateDefinition?: string;
  dateAdded?: string; // Date when this word will be the daily word (DD/MM/YY)
}

// Form and state types
export interface FormState {
  word: string;
  partOfSpeech: string;
  definition: string;
  alternateDefinition: string;
  synonyms: string[];
  dateAdded: string;
}

export interface ValidationError {
  field: keyof FormState;
  message: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
  next?: { page: number; limit: number };
  prev?: { page: number; limit: number };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface WordsResponse {
  words: WordEntry[];
  pagination?: PaginationInfo;
}

// Query parameters for admin operations
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