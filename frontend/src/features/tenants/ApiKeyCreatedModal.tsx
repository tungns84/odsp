import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import type { ApiKeyCreationResponse } from '../../types/apiKeyTypes';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    apiKey: ApiKeyCreationResponse | null;
}

export function ApiKeyCreatedModal({ isOpen, onClose, apiKey }: Props) {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !apiKey) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey.rawKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg border border-surface-border bg-surface p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text-primary">API Key Generated</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-text-secondary mb-2">
                        Here is your new API key. Please copy it now as you won't be able to see it again.
                    </p>
                    <div className="relative">
                        <pre className="w-full rounded-lg border border-surface-border bg-surface-elevated p-4 text-sm font-mono text-text-primary break-all">
                            {apiKey.rawKey}
                        </pre>
                        <button
                            onClick={handleCopy}
                            className="absolute top-2 right-2 p-2 rounded-lg bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
                            title="Copy to clipboard"
                        >
                            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
