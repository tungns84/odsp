import { useState, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { apiKeyService } from '../../services/apiKeyService';
import type { ApiKey, ApiKeyCreationResponse } from '../../types/apiKeyTypes';
import { ApiKeyStatsCards } from './ApiKeyStatsCards';
import { ApiKeyTable } from './ApiKeyTable';
import { GenerateApiKeyModal } from './GenerateApiKeyModal';
import { ApiKeyCreatedModal } from './ApiKeyCreatedModal';

interface Props {
    tenantId: string;
    onBack?: () => void;
}

export function ApiKeyManagement({ tenantId, onBack }: Props) {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [createdKeyResponse, setCreatedKeyResponse] = useState<ApiKeyCreationResponse | null>(null);

    const fetchApiKeys = async () => {
        try {
            setLoading(true);
            const data = await apiKeyService.getApiKeysByTenant(tenantId);
            setApiKeys(data);
        } catch (error) {
            console.error('Failed to fetch API keys:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tenantId) {
            fetchApiKeys();
        }
    }, [tenantId]);

    const handleGenerateSuccess = (response: ApiKeyCreationResponse) => {
        setIsGenerateModalOpen(false);
        setCreatedKeyResponse(response);
        fetchApiKeys();
    };

    const handleRevoke = async (id: string) => {
        if (confirm('Are you sure you want to revoke this API key? It will stop working immediately.')) {
            try {
                await apiKeyService.revokeApiKey(id);
                fetchApiKeys();
            } catch (error) {
                console.error('Failed to revoke API key:', error);
                alert('Failed to revoke API key');
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this API key history? This action cannot be undone.')) {
            try {
                await apiKeyService.deleteApiKey(id);
                fetchApiKeys();
            } catch (error) {
                console.error('Failed to delete API key:', error);
                alert('Failed to delete API key');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-text-secondary"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">API Keys</h2>
                        <p className="text-text-secondary text-sm mt-1">Manage API access keys for this tenant</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    Generate New Key
                </button>
            </div>

            <ApiKeyStatsCards apiKeys={apiKeys} />

            <ApiKeyTable
                apiKeys={apiKeys}
                loading={loading}
                onRevoke={handleRevoke}
                onDelete={handleDelete}
            />

            {isGenerateModalOpen && (
                <GenerateApiKeyModal
                    tenantId={tenantId}
                    onClose={() => setIsGenerateModalOpen(false)}
                    onSuccess={handleGenerateSuccess}
                />
            )}

            {createdKeyResponse && (
                <ApiKeyCreatedModal
                    response={createdKeyResponse}
                    onClose={() => setCreatedKeyResponse(null)}
                />
            )}
        </div>
    );
}
