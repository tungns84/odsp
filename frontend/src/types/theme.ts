export type ThemeColor = 'blue' | 'purple' | 'green' | 'orange' | 'red';

export type ThemeMode = 'dark' | 'light';

export const AVAILABLE_THEMES: readonly ThemeColor[] = [
    'blue',
    'purple',
    'green',
    'orange',
    'red',
] as const;

export const THEME_LABELS: Record<ThemeColor, string> = {
    blue: 'Blue',
    purple: 'Purple',
    green: 'Green',
    orange: 'Orange',
    red: 'Red',
};

export const DEFAULT_THEME: ThemeColor = 'blue';
export const DEFAULT_MODE: ThemeMode = 'dark';
export const MODE_STORAGE_KEY = 'ldop-theme-mode';
