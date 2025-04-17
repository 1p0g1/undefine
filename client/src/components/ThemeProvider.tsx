import React, { createContext, useContext, ReactNode } from 'react';
import useTheme from '../hooks/useTheme';

// Theme context type
type ThemeContextType = {
  theme: string;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  systemTheme: 'light' | 'dark';
};

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  systemTheme: 'light'
});

// Hook for consuming the theme context
export const useThemeContext = () => useContext(ThemeContext);

// ThemeProvider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const themeState = useTheme();
  
  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 