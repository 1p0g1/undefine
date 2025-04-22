import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../config.js';
import useTheme from './useTheme.js';

// Settings interfaces
export interface NotificationSettings {
  dailyReminder: boolean;
  gameResults: boolean;
  achievements: boolean;
}

export interface UserSettings {
  notifications: NotificationSettings;
  language: string;
}

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    dailyReminder: false,
    gameResults: false,
    achievements: false
  },
  language: 'en'
};

// Available languages
const SUPPORTED_LANGUAGES = ['en', 'es', 'fr'];

// Local storage key
const SETTINGS_STORAGE_KEY = 'undefine_user_settings';

/**
 * Hook for managing user settings across the application
 * @returns {Object} Settings state and methods
 * @returns {UserSettings} settings - Current settings
 * @returns {string} theme - Current theme
 * @returns {string} systemTheme - System preferred theme 
 * @returns {boolean} isLoading - Loading state
 * @returns {string|null} error - Error message if any
 * @returns {boolean} isSaved - Whether settings were saved
 * @returns {Function} updateNotificationSetting - Function to update notification settings
 * @returns {Function} updateLanguage - Function to update language
 * @returns {Function} setTheme - Function to set theme
 * @returns {Function} resetToDefaults - Function to reset settings to defaults
 * @returns {Function} saveSettingsToAPI - Function to save settings to API
 */
export const useSettings = () => {
  const [settings, setSettingsState] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  
  // Use the theme hook
  const { theme, setTheme, systemTheme } = useTheme();
  
  // Load settings from localStorage
  const loadSettingsFromStorage = useCallback((): UserSettings | null => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (err) {
      console.error('Failed to load settings from localStorage:', err);
    }
    return null;
  }, []);
  
  // Save settings to localStorage
  const saveSettingsToStorage = useCallback((newSettings: UserSettings): void => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (err) {
      console.error('Failed to save settings to localStorage:', err);
    }
  }, []);
  
  // Validate and normalize settings
  const validateSettings = useCallback((settingsToValidate: UserSettings): UserSettings => {
    const validatedSettings = { ...settingsToValidate };
    
    // Validate language
    if (!SUPPORTED_LANGUAGES.includes(validatedSettings.language)) {
      validatedSettings.language = 'en';
    }
    
    return validatedSettings;
  }, []);
  
  // Notification toggle handler
  const updateNotificationSetting = useCallback((key: keyof NotificationSettings, value?: boolean) => {
    setSettingsState(prev => {
      const newValue = value !== undefined ? value : !prev.notifications[key];
      
      const updatedSettings = {
        ...prev,
        notifications: {
          ...prev.notifications,
          [key]: newValue
        }
      };
      
      saveSettingsToStorage(updatedSettings);
      return updatedSettings;
    });
  }, [saveSettingsToStorage]);
  
  // Update language
  const updateLanguage = useCallback((language: string) => {
    if (SUPPORTED_LANGUAGES.includes(language)) {
      setSettingsState(prev => {
        const updatedSettings = {
          ...prev,
          language
        };
        saveSettingsToStorage(updatedSettings);
        return updatedSettings;
      });
    } else {
      setError(`Language "${language}" is not supported. Using English instead.`);
      setSettingsState(prev => {
        const updatedSettings = {
          ...prev,
          language: 'en'
        };
        saveSettingsToStorage(updatedSettings);
        return updatedSettings;
      });
    }
  }, [saveSettingsToStorage]);
  
  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    const defaultSettings = { ...DEFAULT_SETTINGS };
    setSettingsState(defaultSettings);
    saveSettingsToStorage(defaultSettings);
    setTheme('system');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  }, [saveSettingsToStorage, setTheme]);
  
  // Save settings to API
  const saveSettingsToAPI = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsSaved(false);
    
    try {
      const settingsWithTheme = {
        ...settings,
        theme
      };
      
      const response = await fetch(getApiUrl('/api/settings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: settingsWithTheme })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server error');
      }
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      console.error('Failed to save settings to API:', err);
      setError(err.message || 'Failed to save settings to server, but saved locally.');
      // Even if API save fails, we still have it in localStorage
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [settings, theme]);
  
  // Initialize settings
  useEffect(() => {
    const initializeSettings = async () => {
      setIsLoading(true);
      
      try {
        // First try to fetch from API
        const response = await fetch(getApiUrl('/api/settings'));
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            const validatedSettings = validateSettings(data.settings);
            setSettingsState(validatedSettings);
            saveSettingsToStorage(validatedSettings);
            
            // Set theme if provided by API
            if (data.settings.theme) {
              setTheme(data.settings.theme);
            }
            
            setIsLoading(false);
            return;
          }
        }
        
        // If API fails, try localStorage
        const storedSettings = loadSettingsFromStorage();
        if (storedSettings) {
          const validatedSettings = validateSettings(storedSettings);
          setSettingsState(validatedSettings);
          setIsLoading(false);
          return;
        }
        
        // If all else fails, use default settings
        setSettingsState(DEFAULT_SETTINGS);
        saveSettingsToStorage(DEFAULT_SETTINGS);
      } catch (err) {
        console.error('Failed to initialize settings:', err);
        setError('Failed to load settings. Using defaults instead.');
        
        // Use default settings on error
        setSettingsState(DEFAULT_SETTINGS);
        saveSettingsToStorage(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeSettings();
  }, [loadSettingsFromStorage, saveSettingsToStorage, validateSettings, setTheme]);
  
  return {
    settings,
    theme,
    systemTheme,
    isLoading,
    error,
    isSaved,
    updateNotificationSetting,
    updateLanguage,
    setTheme,
    resetToDefaults,
    saveSettingsToAPI
  };
};

export default useSettings; 