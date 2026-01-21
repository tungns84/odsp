import React from 'react';
import { cn } from '../../utils/cn';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
    ({ error, className, ...props }, ref) => {
        return (
            <input
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

FormInput.displayName = 'FormInput';
