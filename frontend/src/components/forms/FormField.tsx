import React from 'react';

interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
    htmlFor?: string;
}

export function FormField({ label, error, required, children, htmlFor }: FormFieldProps) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={htmlFor} className="text-sm font-medium text-text-secondary">
                {label} {required && <span className="text-error">*</span>}
            </label>
            {children}
            {error && (
                <span className="text-xs text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {error}
                </span>
            )}
        </div>
    );
}
