// ⛔ Do not use .js extensions in TypeScript imports. See ARCHITECTURE.md
import { API_CONFIG } from '../config/api';
/**
 * Base API URL
 */
const API_URL = API_CONFIG.baseUrl;
const API_BASE_URL = `${API_URL}/api`;
/**
 * Create query string from parameters
 */
const createQueryString = (params) => {
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
const handleRequest = async (url, options = {}) => {
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
        }
        else {
            data = await response.text();
        }
        // Handle error responses
        if (!response.ok) {
            return {
                success: false,
                error: {
                    code: response.status.toString(),
                    message: data.error || `HTTP error! status: ${response.status}`,
                    details: data
                }
            };
        }
        // Return successful response
        return {
            success: true,
            data: data
        };
    }
    catch (error) {
        console.error('API request failed:', error);
        return {
            success: false,
            error: {
                code: 'UNKNOWN_ERROR',
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                details: error
            }
        };
    }
};
/**
 * Get words with optional pagination and filters
 */
export const getWords = async (params = { page: 1, limit: 10 }) => {
    const queryString = createQueryString(params);
    return handleRequest(`${API_BASE_URL}/admin/words${queryString}`);
};
/**
 * Get a single word by its name
 */
export const getWord = async (word) => {
    return handleRequest(`${API_BASE_URL}/admin/words/${word}`);
};
/**
 * Create a new word
 */
export const createWord = async (wordData) => {
    return handleRequest(`${API_BASE_URL}/admin/words`, {
        method: 'POST',
        body: JSON.stringify(wordData)
    });
};
/**
 * Update an existing word
 */
export const updateWord = async (originalWord, wordData) => {
    return handleRequest(`${API_BASE_URL}/admin/words/${originalWord}`, {
        method: 'PUT',
        body: JSON.stringify(wordData)
    });
};
/**
 * Delete a word
 */
export const deleteWord = async (word) => {
    return handleRequest(`${API_BASE_URL}/admin/words/${word}`, {
        method: 'DELETE'
    });
};
/**
 * Bulk delete multiple words
 */
export const bulkDeleteWords = async (words) => {
    return handleRequest(`${API_BASE_URL}/admin/words/bulk-delete`, {
        method: 'POST',
        body: JSON.stringify({ words })
    });
};
/**
 * Bulk update multiple words
 */
export const bulkUpdateWords = async (words, updates) => {
    return handleRequest(`${API_BASE_URL}/admin/words/bulk-update`, {
        method: 'POST',
        body: JSON.stringify({ words, updates })
    });
};
/**
 * Export words data
 */
export const exportWords = async (format = 'json') => {
    const response = await fetch(`${API_BASE_URL}/admin/words/export?format=${format}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.blob();
};
/**
 * Import words data (CSV or JSON)
 */
export const importWords = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return handleRequest(`${API_BASE_URL}/admin/words/import`, {
        method: 'POST',
        body: formData
    });
};
/**
 * Search words by query string
 */
export const searchWords = async (query) => {
    return handleRequest(`${API_BASE_URL}/admin/words/search?q=${encodeURIComponent(query)}`);
};
class ApiService {
    constructor() {
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.baseUrl = API_CONFIG.baseUrl;
    }
    async fetch(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            const data = await response.json();
            if (!response.ok) {
                return {
                    success: false,
                    error: {
                        code: response.status.toString(),
                        message: data.error || `HTTP error! status: ${response.status}`,
                        details: data
                    }
                };
            }
            return {
                success: true,
                data: data
            };
        }
        catch (error) {
            console.error('API request failed:', error);
            return {
                success: false,
                error: {
                    code: 'UNKNOWN_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    details: error
                }
            };
        }
    }
    async getTodaysWord() {
        return this.fetch(`${API_CONFIG.endpoints.words}/today`);
    }
    async submitGuess(wordId, guess) {
        return this.fetch(`${API_CONFIG.endpoints.guesses}`, {
            method: 'POST',
            body: JSON.stringify({ wordId, guess })
        });
    }
    async getUserStats(userId) {
        return this.fetch(`${API_CONFIG.endpoints.stats}/${userId}`);
    }
    async getLeaderboard() {
        return this.fetch(`${API_CONFIG.endpoints.leaderboard}`);
    }
    async createGameSession() {
        return this.fetch(`${API_CONFIG.endpoints.guesses}/session`, {
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
