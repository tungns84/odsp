import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { AVAILABLE_THEMES } from '../types/theme';

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    const toggleMode = () => {
        context.setMode(context.mode === 'dark' ? 'light' : 'dark');
    };

    return {
        ...context,
        availableThemes: AVAILABLE_THEMES,
        toggleMode,
    };
};
