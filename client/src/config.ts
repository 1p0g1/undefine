// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5179';

/**
 * Builds a complete API URL by combining the base URL with the provided endpoint
 * @param {string} endpoint - The API endpoint (should start with '/')
 * @returns {string} The complete API URL
 */
export const buildApiUrl = (endpoint: string): string => {
  // Remove any double slashes except for http(s)://
  return `${API_BASE_URL}${endpoint}`.replace(/([^:]\/)\/+/g, '$1');
};

/**
 * Alias for backward compatibility
 * @param {string} endpoint - The API endpoint (should start with '/')
 * @returns {string} The complete API URL 
 */
export const getApiUrl = buildApiUrl; 