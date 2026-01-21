import React from 'react';
import { cn } from '../../utils/cn';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
    ({ error, className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={cn(
                    'w-full rounded-lg border bg-surface-elevated px-3 py-2 text-text-primary',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
                    error
                        ? 'border-error focus:ring-error'
                        : 'border-surface-border focus:ring-focus-ring',
                    className
                )}
                {...props}
            />
        );
    }
);

FormTextarea.displayName = 'FormTextarea';
