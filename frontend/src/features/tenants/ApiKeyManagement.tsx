import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { apiKeyService } from '../../services/apiKeyService';
import type { ApiKey, ApiKeyCreationResponse } from '../../types/apiKeyTypes';
import { ApiKeyTable } from './ApiKeyTable';
import { GenerateApiKeyModal } from './GenerateApiKeyModal';
import { ApiKeyCreatedModal } from './ApiKeyCreatedModal';

interface Props {
    tenantId: string;
}

export function ApiKeyManagement({ tenantId }: Props) {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [createdApiKey, setCreatedApiKey] = useState<ApiKeyCreationResponse | null>(null);

    const fetchApiKeys = async () => {
        setLoading(true);
        try {
            const response = await apiKeyService.getApiKeysByTenant(tenantId);
            setApiKeys(response.data);
        } catch (error) {
            console.error('Failed to fetch API keys:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApiKeys();
    }, [tenantId]);

    const handleGenerateSuccess = (key: ApiKeyCreationResponse) => {
        setIsGenerateModalOpen(false);
        setCreatedApiKey(key);
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
        if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-text-primary">API Keys</h3>
                <button
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    Generate API Key
                </button>
            </div>

            <ApiKeyTable
                apiKeys={apiKeys}
                loading={loading}
                onRevoke={handleRevoke}
                onDelete={handleDelete}
            />

            <GenerateApiKeyModal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                onSuccess={handleGenerateSuccess}
                tenantId={tenantId}
            />

            <ApiKeyCreatedModal
                isOpen={!!createdApiKey}
                onClose={() => setCreatedApiKey(null)}
                apiKey={createdApiKey}
            />
        </div>
    );
}
