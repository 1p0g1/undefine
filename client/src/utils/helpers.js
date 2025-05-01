/**
 * Collection of general helper functions
 */
/**
 * Debounce function to limit how often a function can be called
 */
export const debounce = (fn, delay) => {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};
/**
 * Throttle function to limit how often a function can be called
 */
export const throttle = (fn, limit) => {
    let waiting = false;
    let lastArgs = null;
    return function (...args) {
        if (!waiting) {
            fn(...args);
            waiting = true;
            setTimeout(() => {
                waiting = false;
                if (lastArgs) {
                    fn(...lastArgs);
                    lastArgs = null;
                }
            }, limit);
        }
        else {
            lastArgs = args;
        }
    };
};
/**
 * Format bytes to human-readable string
 */
export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
/**
 * Safely parse JSON with error handling
 */
export const safeJsonParse = (json, fallback) => {
    try {
        return JSON.parse(json);
    }
    catch (error) {
        console.error('Failed to parse JSON:', error);
        return fallback;
    }
};
/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value) => {
    if (value === null || value === undefined)
        return true;
    if (typeof value === 'string')
        return value.trim() === '';
    if (Array.isArray(value))
        return value.length === 0;
    if (typeof value === 'object')
        return Object.keys(value).length === 0;
    return false;
};
/**
 * Generate a unique ID
 */
export const generateId = () => {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
};
/**
 * Deep clone an object
 */
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};
/**
 * Check if two objects are deeply equal
 */
export const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2)
        return true;
    if (typeof obj1 !== 'object' ||
        typeof obj2 !== 'object' ||
        obj1 === null ||
        obj2 === null) {
        return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length)
        return false;
    for (const key of keys1) {
        if (!keys2.includes(key))
            return false;
        if (!deepEqual(obj1[key], obj2[key]))
            return false;
    }
    return true;
};
/**
 * Convert a string to title case
 */
export const toTitleCase = (str) => {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
/**
 * Create a delay using Promise
 */
export const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
