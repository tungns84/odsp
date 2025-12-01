/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Primary colors (theme-aware)
                primary: 'hsl(var(--color-primary) / <alpha-value>)',
                'primary-hover': 'hsl(var(--color-primary-hover) / <alpha-value>)',
                'primary-active': 'hsl(var(--color-primary-active) / <alpha-value>)',

                // Surface colors (backgrounds)
                surface: 'hsl(var(--color-surface) / <alpha-value>)',
                'surface-elevated': 'hsl(var(--color-surface-elevated) / <alpha-value>)',
                'surface-elevated-hover': 'hsl(var(--color-surface-elevated-hover) / <alpha-value>)',
                'surface-card': 'hsl(var(--color-surface-card) / <alpha-value>)',

                // Border colors
                'surface-border': 'hsl(var(--color-surface-border) / <alpha-value>)',
                'surface-border-subtle': 'hsl(var(--color-surface-border-subtle) / <alpha-value>)',

                // Text colors
                'text-primary': 'hsl(var(--color-text-primary) / <alpha-value>)',
                'text-secondary': 'hsl(var(--color-text-secondary) / <alpha-value>)',
                'text-tertiary': 'hsl(var(--color-text-tertiary) / <alpha-value>)',

                // Status colors
                success: 'hsl(var(--color-success) / <alpha-value>)',
                'success-bg': 'hsl(var(--color-success-bg) / <alpha-value>)',
                'success-border': 'hsl(var(--color-success-border) / <alpha-value>)',
                error: 'hsl(var(--color-error) / <alpha-value>)',
                'error-bg': 'hsl(var(--color-error-bg) / <alpha-value>)',
                'error-border': 'hsl(var(--color-error-border) / <alpha-value>)',

                // Legacy support (will be migrated)
                'background-light': '#f6f7f8',
                'background-dark': '#101922',
            },
            fontFamily: {
                display: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '0.25rem',
                lg: '0.5rem',
                xl: '0.75rem',
                full: '9999px',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
