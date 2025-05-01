import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
import useTheme from '../hooks/useTheme';
// Create context with default values
const ThemeContext = createContext({
    theme: 'system',
    setTheme: () => { },
    systemTheme: 'light'
});
// Hook for consuming the theme context
export const useThemeContext = () => useContext(ThemeContext);
// ThemeProvider component
export const ThemeProvider = ({ children }) => {
    const themeState = useTheme();
    return (_jsx(ThemeContext.Provider, { value: themeState, children: children }));
};
export default ThemeProvider;
