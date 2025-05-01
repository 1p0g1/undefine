/// <reference types="vite/client" />
// API configuration
const API_BASE_URL = (() => {
    const configuredUrl = import.meta.env.VITE_API_URL;
    if (!configuredUrl) {
        if (import.meta.env.MODE === 'production') {
            console.error('⚠️ Missing VITE_API_URL in production build! API calls may fail.');
        }
        else {
            console.warn('No VITE_API_URL found, using default localhost:5179');
        }
        return 'http://localhost:5179';
    }
    return configuredUrl;
})();
/**
 * Builds a complete API URL by combining the base URL with the provided endpoint
 * @param {string} endpoint - The API endpoint (should start with '/')
 * @returns {string} The complete API URL
 */
export const buildApiUrl = (endpoint) => {
    // Remove any double slashes except for http(s)://
    return `${API_BASE_URL}${endpoint}`.replace(/([^:]\/)\/+/g, '$1');
};
/**
 * Alias for backward compatibility
 * @param {string} endpoint - The API endpoint (should start with '/')
 * @returns {string} The complete API URL
 */
export const getApiUrl = buildApiUrl;
