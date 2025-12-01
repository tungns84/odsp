import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { apiKeyService } from '../../services/apiKeyService';
import type { ApiKeyCreationResponse, CreateApiKeyRequest } from '../../types/apiKeyTypes';

interface Props {
    tenantId: string;
    onClose: () => void;
    onSuccess: (response: ApiKeyCreationResponse) => void;
}

export function GenerateApiKeyModal({ tenantId, onClose, onSuccess }: Props) {
    const [formData, setFormData] = useState<CreateApiKeyRequest>({
        name: '',
        expiresAt: undefined,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Helper to set expiration date
    const handleExpirationChange = (days: number | null) => {
        if (days === null) {
            setFormData({ ...formData, expiresAt: undefined });
        } else {
            const date = new Date();
            date.setDate(date.getDate() + days);
            setFormData({ ...formData, expiresAt: date.toISOString() });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiKeyService.generateApiKey(tenantId, formData);
            onSuccess(response);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to generate API key');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface border border-surface-border rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">Generate API Key</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-surface-elevated rounded-lg transition-colors text-text-secondary"
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Key Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 bg-surface-elevated border border-surface-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g., Production Service Key"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Expiration</label>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                                <button
                                    type="button"
                                    onClick={() => handleExpirationChange(30)}
                                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${formData.expiresAt && new Date(formData.expiresAt).getTime() - Date.now() < 31 * 24 * 60 * 60 * 1000 && new Date(formData.expiresAt).getTime() - Date.now() > 29 * 24 * 60 * 60 * 1000
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-surface-elevated border-surface-border text-text-secondary hover:border-primary/50'
                                        }`}
                                >
                                    30 Days
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExpirationChange(90)}
                                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${formData.expiresAt && new Date(formData.expiresAt).getTime() - Date.now() > 89 * 24 * 60 * 60 * 1000
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-surface-elevated border-surface-border text-text-secondary hover:border-primary/50'
                                        }`}
                                >
                                    90 Days
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExpirationChange(null)}
                                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${formData.expiresAt === undefined
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-surface-elevated border-surface-border text-text-secondary hover:border-primary/50'
                                        }`}
                                >
                                    Never
                                </button>
                            </div>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={18} />
                                <input
                                    type="datetime-local"
                                    value={formData.expiresAt ? formData.expiresAt.slice(0, 16) : ''}
                                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                                    className="w-full pl-10 pr-4 py-2 bg-surface-elevated border border-surface-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-surface-elevated hover:bg-surface-elevated/80 text-text-primary rounded-lg transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Generate Key'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
