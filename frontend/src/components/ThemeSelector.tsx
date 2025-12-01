import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import type { ThemeColor } from '../types/theme';
import { THEME_LABELS } from '../types/theme';

const THEME_COLORS: Record<ThemeColor, string> = {
    blue: 'hsl(207, 89%, 61%)',
    purple: 'hsl(271, 76%, 53%)',
    green: 'hsl(142, 71%, 45%)',
    orange: 'hsl(25, 95%, 53%)',
    red: 'hsl(0, 72%, 51%)',
};

export const ThemeSelector: React.FC = () => {
    const { theme, setTheme, availableThemes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleThemeSelect = (selectedTheme: ThemeColor) => {
        setTheme(selectedTheme);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated-hover transition-colors"
                aria-label="Select theme color"
            >
                <div
                    className="h-4 w-4 rounded-full border border-white/20"
                    style={{ backgroundColor: THEME_COLORS[theme] }}
                />
                <span className="hidden sm:inline">{THEME_LABELS[theme]}</span>
                <span className="material-symbols-outlined text-base">
                    {isOpen ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-surface-border bg-surface-card shadow-lg z-50">
                    <div className="p-2">
                        <div className="mb-2 px-2 py-1 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                            Theme Color
                        </div>
                        {availableThemes.map((colorTheme) => (
                            <button
                                key={colorTheme}
                                onClick={() => handleThemeSelect(colorTheme)}
                                className={`
                  w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-left
                  transition-colors
                  ${theme === colorTheme
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-text-secondary hover:bg-surface-elevated'
                                    }
                `}
                            >
                                <div
                                    className="h-5 w-5 rounded-full border-2 border-white/20 shadow-sm flex-shrink-0"
                                    style={{ backgroundColor: THEME_COLORS[colorTheme] }}
                                />
                                <span className="flex-1">{THEME_LABELS[colorTheme]}</span>
                                {theme === colorTheme && (
                                    <span className="material-symbols-outlined text-base">check</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
