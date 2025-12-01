import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { apiKeyService } from '../../services/apiKeyService';
import type { ApiKeyCreationResponse } from '../../types/apiKeyTypes';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (key: ApiKeyCreationResponse) => void;
    tenantId: string;
}

export function GenerateApiKeyModal({ isOpen, onClose, onSuccess, tenantId }: Props) {
    const [name, setName] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await apiKeyService.generateApiKey(tenantId, {
                name,
                expiresAt: expiresAt || undefined
            });
            onSuccess(response.data);
            setName('');
            setExpiresAt('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to generate API key');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg border border-surface-border bg-surface p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text-primary">Generate API Key</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20 flex gap-3">
                    <AlertTriangle className="text-yellow-500 shrink-0" size={24} />
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        The API key will be displayed only once. Please make sure to save it in a secure location.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Key Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-text-primary focus:border-primary focus:outline-none"
                            placeholder="e.g., Production App"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Expiration Date (Optional)
                        </label>
                        <input
                            type="date"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-text-primary focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-surface-border text-text-secondary hover:bg-surface-elevated transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
