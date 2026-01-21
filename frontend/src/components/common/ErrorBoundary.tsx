import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';

interface Props {
    children: ReactNode;
    fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public resetErrorBoundary = () => {
        this.props.onReset?.();
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError && this.state.error) {
            const FallbackComponent = this.props.fallback || ErrorFallback;
            return (
                <FallbackComponent
                    error={this.state.error}
                    resetErrorBoundary={this.resetErrorBoundary}
                />
            );
        }

        return this.props.children;
    }
}
