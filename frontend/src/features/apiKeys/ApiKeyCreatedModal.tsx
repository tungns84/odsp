import { useState } from 'react';
import { Check, Copy, AlertTriangle } from 'lucide-react';
import type { ApiKeyCreationResponse } from '../../types/apiKeyTypes';

interface Props {
    response: ApiKeyCreationResponse;
    onClose: () => void;
}

export function ApiKeyCreatedModal({ response, onClose }: Props) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(response.rawKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface border border-surface-border rounded-lg p-6 w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                        <Check className="text-green-500" size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary">API Key Generated</h2>
                    <p className="text-text-secondary mt-2">
                        Please copy your API key now. You won't be able to see it again!
                    </p>
                </div>

                <div className="bg-surface-elevated border border-surface-border rounded-lg p-4 mb-6 relative group">
                    <code className="text-primary font-mono text-sm break-all block pr-8">
                        {response.rawKey}
                    </code>
                    <button
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-2 hover:bg-surface rounded-lg transition-colors text-text-secondary hover:text-primary"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>

                <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
                    <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-yellow-500">
                        Store this key securely. If you lose it, you will need to generate a new one.
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
                >
                    I have copied the key
                </button>
            </div>
        </div>
    );
}
