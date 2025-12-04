import { apiClient } from './api';
import type { Connector } from '../types/connector';

export const connectorService = {
    /**
     * Get all connectors for the current tenant
     */
    getAll: () => apiClient.get<import('../types/connector').ConnectorSummary[]>('/api/v1/connectors'),

    /**
     * Get a specific connector by ID
     */
    getById: (id: string) => apiClient.get<Connector>(`/api/v1/connectors/${id}`),

    /**
     * Create a new connector (status will be INIT by default)
     */
    create: (connector: Omit<Connector, 'id' | 'status' | 'createdAt' | 'tenantId'>) =>
        apiClient.post<Connector>('/api/v1/connectors', connector),

    /**
     * Update an existing connector
     */
    update: (id: string, connector: Partial<Connector>) =>
        apiClient.put<Connector>(`/api/v1/connectors/${id}`, connector),

    /**
     * Update connector approval status (APPROVED or REJECTED)
     */
    updateApprovalStatus: (id: string, status: 'APPROVED' | 'REJECTED') =>
        apiClient.put<Connector>(`/api/v1/connectors/${id}/approval`, { status }),

    /**
     * Delete a connector
     */
    delete: (id: string) => apiClient.delete(`/api/v1/connectors/${id}`),

    /**
     * Test connection and fetch available tables
     */
    testConnectionAndFetchTables: (config: Record<string, unknown>) =>
        apiClient.post<import('../types/connector').TableMetadata[]>('/api/v1/connectors/test-connection', config),

    /**
     * Get tables for a specific connector
     */
    getTables: (id: string) => apiClient.get<import('../types/connector').TableMetadata[]>(`/api/v1/connectors/${id}/tables`),

    /**
     * Test connection for an existing connector
     */
    testConnectionById: (id: string) => apiClient.post<void>(`/api/v1/connectors/${id}/test-connection`, {}),
};
