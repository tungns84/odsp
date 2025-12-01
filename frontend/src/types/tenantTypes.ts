export type TenantStatus = 'ACTIVE' | 'INACTIVE';

export interface Tenant {
    id: string;
    name: string;
    description?: string;
    status: TenantStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTenantRequest {
    name: string;
    description?: string;
}

export interface UpdateTenantRequest {
    name: string;
    description?: string;
    status: TenantStatus;
}
