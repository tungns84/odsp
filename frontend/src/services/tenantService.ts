import { apiClient } from './api';
import type { Tenant, CreateTenantRequest, UpdateTenantRequest, TenantStatus } from '../types/tenantTypes';

export const tenantService = {
    async getAllTenants(filters?: { status?: TenantStatus; search?: string }) {
        return apiClient.get<Tenant[]>('/api/v1/tenants', { params: filters });
    },

    async getTenantById(id: string) {
        return apiClient.get<Tenant>(`/api/v1/tenants/${id}`);
    },

    async createTenant(data: CreateTenantRequest) {
        return apiClient.post<Tenant>('/api/v1/tenants', data);
    },

    async updateTenant(id: string, data: UpdateTenantRequest) {
        return apiClient.put<Tenant>(`/api/v1/tenants/${id}`, data);
    },

    async deleteTenant(id: string) {
        return apiClient.delete(`/api/v1/tenants/${id}`);
    },

    async updateTenantStatus(id: string, status: TenantStatus) {
        return apiClient.put<Tenant>(`/api/v1/tenants/${id}/status`, { status });
    }
};
