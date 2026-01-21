import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test error');
    }
    return <div>Normal content</div>;
};

describe('ErrorBoundary', () => {
    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <div>Safe content</div>
            </ErrorBoundary>
        );
        expect(screen.getByText('Safe content')).toBeInTheDocument();
    });

    it('renders fallback UI when an error occurs', () => {
        // Prevent console.error from cluttering the test output
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Test error')).toBeInTheDocument();

        consoleSpy.mockRestore();
    });

    it('resets error state when Try Again is clicked', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const onReset = vi.fn();

        const TestComponent = () => {
            const [shouldThrow, setShouldThrow] = React.useState(true);
            return (
                <ErrorBoundary onReset={() => {
                    setShouldThrow(false);
                    onReset();
                }}>
                    <ThrowError shouldThrow={shouldThrow} />
                </ErrorBoundary>
            );
        };

        // We need React for useState
        // const React = require('react');

        render(<TestComponent />);

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Try Again'));

        expect(screen.getByText('Normal content')).toBeInTheDocument();
        expect(onReset).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});
