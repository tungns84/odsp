import React from 'react';
import { useTheme } from '../hooks/useTheme';

export const ModeToggle: React.FC = () => {
    const { mode, toggleMode } = useTheme();

    return (
        <button
            onClick={toggleMode}
            className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated-hover transition-colors"
            aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
        >
            <span className="material-symbols-outlined text-base">
                {mode === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <span className="hidden sm:inline">
                {mode === 'dark' ? 'Light' : 'Dark'} Mode
            </span>
        </button>
    );
};
