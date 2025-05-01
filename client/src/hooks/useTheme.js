import { useState, useEffect, useCallback } from 'react';
const THEME_STORAGE_KEY = 'undefine_theme';
/**
 * Hook for managing theme with system preference detection
 */
export const useTheme = (initialTheme = 'system') => {
    // Initialize from localStorage or default
    const getInitialTheme = () => {
        try {
            const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
            if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
                return storedTheme;
            }
        }
        catch (e) {
            console.error('Failed to read theme from localStorage:', e);
        }
        return initialTheme;
    };
    const [theme, setThemeState] = useState(getInitialTheme);
    // Get system color scheme
    const getSystemTheme = useCallback(() => {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }, []);
    // Apply theme to document
    const applyTheme = useCallback((newTheme) => {
        const themeToApply = newTheme === 'system' ? getSystemTheme() : newTheme;
        document.documentElement.setAttribute('data-theme', themeToApply);
    }, [getSystemTheme]);
    // Set theme with storage and application
    const setTheme = useCallback((newTheme) => {
        setThemeState(newTheme);
        try {
            localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        }
        catch (e) {
            console.error('Failed to save theme to localStorage:', e);
        }
        applyTheme(newTheme);
    }, [applyTheme]);
    // Apply theme on initial render
    useEffect(() => {
        applyTheme(theme);
    }, [theme, applyTheme]);
    // Listen for system preference changes
    useEffect(() => {
        if (theme !== 'system')
            return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            applyTheme('system');
        };
        // Add event listener with backward compatibility
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
        }
        else {
            // For older browsers
            mediaQuery.addListener(handleChange);
        }
        // Cleanup
        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleChange);
            }
            else {
                // For older browsers
                mediaQuery.removeListener(handleChange);
            }
        };
    }, [theme, applyTheme]);
    return { theme, setTheme, systemTheme: getSystemTheme() };
};
export default useTheme;
