import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorFallback } from './ErrorFallback';

interface Props {
    children: React.ReactNode;
}

export const RouteErrorBoundary: React.FC<Props> = ({ children }) => {
    return (
        <ErrorBoundary
            fallback={({ error, resetErrorBoundary }) => (
                <div className="min-h-screen flex items-center justify-center bg-surface p-4">
                    <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
                </div>
            )}
            onReset={() => window.location.reload()}
        >
            {children}
        </ErrorBoundary>
    );
};
