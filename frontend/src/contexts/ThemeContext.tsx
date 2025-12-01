import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ThemeColor, ThemeMode } from '../types/theme';
import { DEFAULT_THEME, DEFAULT_MODE, MODE_STORAGE_KEY } from '../types/theme';

const THEME_STORAGE_KEY = 'ldop-theme';

interface ThemeContextValue {
    theme: ThemeColor;
    setTheme: (theme: ThemeColor) => void;
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    // Initialize theme from localStorage or use default
    const [theme, setThemeState] = useState<ThemeColor>(() => {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        return (savedTheme as ThemeColor) || DEFAULT_THEME;
    });

    // Initialize mode from localStorage or use default
    const [mode, setModeState] = useState<ThemeMode>(() => {
        const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
        return (savedMode as ThemeMode) || DEFAULT_MODE;
    });

    // Apply theme and mode to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-mode', mode);
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        localStorage.setItem(MODE_STORAGE_KEY, mode);
    }, [theme, mode]);

    const setTheme = (newTheme: ThemeColor) => {
        setThemeState(newTheme);
    };

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, mode, setMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
