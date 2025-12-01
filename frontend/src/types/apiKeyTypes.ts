export type ApiKeyStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export interface ApiKey {
    id: string;
    tenantId: string;
    name: string;
    prefix: string;
    status: ApiKeyStatus;
    expiresAt?: string;
    lastUsedAt?: string;
    createdAt: string;
}

export interface ApiKeyCreationResponse extends ApiKey {
    rawKey: string;
}

export interface CreateApiKeyRequest {
    name: string;
    expiresAt?: string;
}
