import { apiClient } from './api';
import type { ApiKey, CreateApiKeyRequest, ApiKeyCreationResponse, ApiKeyStatus } from '../types/apiKeyTypes';

export const apiKeyService = {
    async getApiKeysByTenant(tenantId: string, filters?: { status?: ApiKeyStatus }) {
        return apiClient.get<ApiKey[]>(`/api/v1/tenants/${tenantId}/api-keys`, { params: filters });
    },

    async generateApiKey(tenantId: string, data: CreateApiKeyRequest) {
        return apiClient.post<ApiKeyCreationResponse>(`/api/v1/tenants/${tenantId}/api-keys`, data);
    },

    async getApiKeyById(id: string) {
        return apiClient.get<ApiKey>(`/api/v1/api-keys/${id}`);
    },

    async revokeApiKey(id: string) {
        return apiClient.put<void>(`/api/v1/api-keys/${id}/revoke`);
    },

    async deleteApiKey(id: string) {
        return apiClient.delete(`/api/v1/api-keys/${id}`);
    }
};
