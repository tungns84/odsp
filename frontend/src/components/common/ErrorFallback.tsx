import React from 'react';

interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center rounded-lg border border-error-border bg-error-bg">
            <div className="mb-4 p-3 rounded-full bg-error text-white">
                <span className="material-symbols-outlined text-3xl">error_outline</span>
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">
                Something went wrong
            </h2>
            <p className="text-sm text-text-secondary mb-6 max-w-md">
                {error.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <button
                onClick={resetErrorBoundary}
                className="px-4 py-2 text-sm font-medium text-white bg-error rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-focus-ring transition-all"
            >
                Try Again
            </button>
        </div>
    );
};
