// ⛔ Do not use .js extensions in TypeScript imports. See ARCHITECTURE.md

import {
  WordEntry,
  PaginationParams,
  PaginationInfo,
  ApiResponse,
  FormState
} from '../types/index.js';
import {
  WordResponse,
  LeaderboardResponse,
  GameSessionResponse,
  UserStatsResponse,
  ErrorResponse,
  DailyWord
} from '../types/index.js';

/**
 * Response type for paginated words
 */
interface WordsResponse {
  words: WordEntry[];
  pagination: PaginationInfo;
}

/**
 * Base API URL
 */
const API_BASE_URL = '/api';

/**
 * Create query string from parameters
 */
const createQueryString = (params: Record<string, any>): string => {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        return `${key}=${encodeURIComponent(JSON.stringify(value))}`;
      }
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join('&');

  return query ? `?${query}` : '';
};

/**
 * Generic request handler with error handling
 */
const handleRequest = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    // Setup headers if not provided
    if (!options.headers) {
      options.headers = {
        'Content-Type': 'application/json'
      };
    }
    
    // Make the request
    const response = await fetch(url, options);
    
    // Try to parse response as JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Handle error responses
    if (!response.ok) {
      return {
        error: data.error || `HTTP error! status: ${response.status}`
      };
    }
    
    // Return successful response
    return { data: data as T };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Get words with optional pagination and filters
 */
export const getWords = async (params: Partial<PaginationParams> = { page: 1, limit: 10 }): Promise<ApiResponse<WordsResponse>> => {
  const queryString = createQueryString(params);
  return handleRequest<WordsResponse>(`${API_BASE_URL}/admin/words${queryString}`);
};

/**
 * Get a single word by its name
 */
export const getWord = async (word: string): Promise<ApiResponse<{ word: WordEntry }>> => {
  return handleRequest<{ word: WordEntry }>(`${API_BASE_URL}/admin/words/${word}`);
};

/**
 * Create a new word
 */
export const createWord = async (wordData: FormState): Promise<ApiResponse<{ word: WordEntry }>> => {
  return handleRequest<{ word: WordEntry }>(`${API_BASE_URL}/admin/words`, {
    method: 'POST',
    body: JSON.stringify(wordData)
  });
};

/**
 * Update an existing word
 */
export const updateWord = async (
  originalWord: string,
  wordData: FormState
): Promise<ApiResponse<{ word: WordEntry }>> => {
  return handleRequest<{ word: WordEntry }>(`${API_BASE_URL}/admin/words/${originalWord}`, {
    method: 'PUT',
    body: JSON.stringify(wordData)
  });
};

/**
 * Delete a word
 */
export const deleteWord = async (word: string): Promise<ApiResponse<{ word: WordEntry }>> => {
  return handleRequest<{ word: WordEntry }>(`${API_BASE_URL}/admin/words/${word}`, {
    method: 'DELETE'
  });
};

/**
 * Bulk delete multiple words
 */
export const bulkDeleteWords = async (words: string[]): Promise<ApiResponse<{ deletedCount: number }>> => {
  return handleRequest<{ deletedCount: number }>(`${API_BASE_URL}/admin/words/bulk-delete`, {
    method: 'POST',
    body: JSON.stringify({ words })
  });
};

/**
 * Bulk update multiple words
 */
export const bulkUpdateWords = async (
  words: string[],
  updates: Partial<WordEntry>
): Promise<ApiResponse<{ updatedCount: number }>> => {
  return handleRequest<{ updatedCount: number }>(`${API_BASE_URL}/admin/words/bulk-update`, {
    method: 'POST',
    body: JSON.stringify({ words, updates })
  });
};

/**
 * Export words data
 */
export const exportWords = async (format: 'json' | 'csv' = 'json'): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/admin/words/export?format=${format}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.blob();
};

/**
 * Import words data (CSV or JSON)
 */
export const importWords = async (file: File): Promise<ApiResponse<{ importedCount: number }>> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return handleRequest<{ importedCount: number }>(`${API_BASE_URL}/admin/words/import`, {
    method: 'POST',
    body: formData,
    headers: {} // Let browser set content-type for FormData
  });
};

export default {
  getWords,
  getWord,
  createWord,
  updateWord,
  deleteWord,
  bulkDeleteWords,
  bulkUpdateWords,
  exportWords,
  importWords
}; 