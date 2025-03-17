/**
 * Local storage utilities for persisting admin panel state and user preferences
 */

const STORAGE_PREFIX = 'reverse_define_admin_';

/**
 * Save data to local storage with the app prefix
 */
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, serializedData);
  } catch (err) {
    console.error('Error saving to local storage:', err);
  }
};

/**
 * Get data from local storage by key
 */
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serializedData = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData) as T;
  } catch (err) {
    console.error('Error retrieving from local storage:', err);
    return defaultValue;
  }
};

/**
 * Remove data from local storage
 */
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (err) {
    console.error('Error removing from local storage:', err);
  }
};

/**
 * Clear all app-related items from storage
 */
export const clearAppStorage = (): void => {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  } catch (err) {
    console.error('Error clearing app storage:', err);
  }
};

/**
 * Storage keys for specific data
 */
export const STORAGE_KEYS = {
  PAGINATION_LIMIT: 'pagination_limit',
  THEME: 'theme',
  DARK_MODE: 'dark_mode',
  LAST_SEARCH: 'last_search',
  VIEW_MODE: 'view_mode',
  SORT_PREFERENCES: 'sort_preferences',
  FILTER_PREFERENCES: 'filter_preferences',
  COLUMN_PREFERENCES: 'column_preferences',
  KEYBOARD_SHORTCUTS_ENABLED: 'keyboard_shortcuts_enabled',
  LAYOUT_PREFERENCES: 'layout_preferences'
};

export default {
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  clearAppStorage,
  STORAGE_KEYS
}; 