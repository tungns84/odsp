import { apiClient } from './api';
import type { DataEndpoint, QueryConfig } from '../types/dataEndpoint';

// Request/Response Types
interface TestQueryRequest {
    connectorId: string;
    queryConfig: QueryConfig;
}

interface TestQueryResponse {
    columns: string[];
    rows: Record<string, any>[];
    rowCount: number;
    generatedSql?: string;
}

interface CreateEndpointRequest {
    name: string;
    description?: string;
    connectorId: string;
    queryConfig: QueryConfig;
    maskingConfig?: Record<string, { type: string; pattern?: string }>;
}

interface QueryDataResponse {
    data: Record<string, any>[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

/**
 * Data Endpoint Service
 * Integrates with backend API for data endpoint management
 */
export const dataEndpointService = {
    /**
     * Get all data endpoints for the current tenant
     */
    async getAll() {
        return apiClient.get<DataEndpoint[]>('/api/v1/data-endpoints');
    },

    /**
     * Get a specific data endpoint by ID
     */
    async getById(id: string) {
        return apiClient.get<DataEndpoint>(`/api/v1/data-endpoints/${id}`);
    },

    /**
     * Test/preview query (returns top 10 rows)
     */
    async testQuery(request: TestQueryRequest) {
        return apiClient.post<TestQueryResponse>('/api/v1/data-endpoints/test', request);
    },

    /**
     * Create a new data endpoint
     */
    async create(request: CreateEndpointRequest) {
        return apiClient.post<DataEndpoint>('/api/v1/data-endpoints', request);
    },

    /**
     * Update an existing data endpoint
     */
    async update(id: string, request: Partial<CreateEndpointRequest>) {
        return apiClient.put<DataEndpoint>(`/api/v1/data-endpoints/${id}`, request);
    },

    /**
     * Delete a data endpoint
     */
    async delete(id: string) {
        return apiClient.delete(`/api/v1/data-endpoints/${id}`);
    },

    /**
     * Toggle endpoint status (ACTIVE <-> INACTIVE)
     */
    async toggleStatus(id: string, newStatus: 'ACTIVE' | 'INACTIVE') {
        return apiClient.patch<DataEndpoint>(`/api/v1/data-endpoints/${id}/status`, {
            status: newStatus
        });
    },

    /**
     * Query data from endpoint with pagination
     */
    async queryData(endpointId: string, page: number = 0, size: number = 10) {
        return apiClient.get<QueryDataResponse>(`/api/v1/data/${endpointId}`, {
            params: { page, size }
        });
    }
};

