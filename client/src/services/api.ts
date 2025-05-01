// ⛔ Do not use .js extensions in TypeScript imports. See ARCHITECTURE.md

import {
  type WordData,
  type PaginationParams,
  type PaginationInfo,
  type ApiResponse,
  type FormState,
  type WordResponse,
  type LeaderboardResponse,
  type GameSessionResponse,
  type UserStatsResponse,
  type ErrorResponse,
  type DailyWord,
  type GuessResult,
  type UserStats,
  type GameSession,
  type LeaderboardEntry
} from '@undefine/shared-types';
import { API_CONFIG } from '../config/api';

/**
 * Response type for paginated words
 */
interface WordsResponse {
  words: WordData[];
  pagination: PaginationInfo;
}

/**
 * Base API URL
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE_URL = `${API_URL}/api`;

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
export const getWord = async (word: string): Promise<ApiResponse<WordResponse>> => {
  return handleRequest<WordResponse>(`${API_BASE_URL}/admin/words/${word}`);
};

/**
 * Create a new word
 */
export const createWord = async (wordData: FormState): Promise<ApiResponse<WordResponse>> => {
  return handleRequest<WordResponse>(`${API_BASE_URL}/admin/words`, {
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
): Promise<ApiResponse<WordResponse>> => {
  return handleRequest<WordResponse>(`${API_BASE_URL}/admin/words/${originalWord}`, {
    method: 'PUT',
    body: JSON.stringify(wordData)
  });
};

/**
 * Delete a word
 */
export const deleteWord = async (word: string): Promise<ApiResponse<WordResponse>> => {
  return handleRequest<WordResponse>(`${API_BASE_URL}/admin/words/${word}`, {
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
  updates: Partial<WordData>
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

/**
 * Search for words
 */
export const searchWords = async (query: string): Promise<ApiResponse<WordsResponse>> => {
  // Return empty results with pagination info
  return {
    data: {
      words: [],
      pagination: {
        page: 1,
        limit: 10,
        totalPages: 0,
        total: 0
      }
    }
  };
};

interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: response.statusText
          }
        };
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }

  async getTodaysWord(): Promise<ApiResponse<WordData>> {
    return this.fetch<WordData>(`${API_CONFIG.endpoints.words}/today`);
  }

  async submitGuess(wordId: string, guess: string): Promise<ApiResponse<GuessResult>> {
    return this.fetch<GuessResult>(`${API_CONFIG.endpoints.guesses}`, {
      method: 'POST',
      body: JSON.stringify({ wordId, guess })
    });
  }

  async getUserStats(userId: string): Promise<ApiResponse<UserStats>> {
    return this.fetch<UserStats>(`${API_CONFIG.endpoints.stats}/${userId}`);
  }

  async getLeaderboard(): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.fetch<LeaderboardEntry[]>(`${API_CONFIG.endpoints.leaderboard}`);
  }

  async createGameSession(): Promise<ApiResponse<GameSession>> {
    return this.fetch<GameSession>(`${API_CONFIG.endpoints.guesses}/session`, {
      method: 'POST'
    });
  }
}

export const useApi = () => {
  return new ApiService();
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
  importWords,
  searchWords
}; 