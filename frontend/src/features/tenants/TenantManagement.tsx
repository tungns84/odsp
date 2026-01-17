import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantService } from '../../services/tenantService';
import type { Tenant, TenantStatus } from '../../types/tenantTypes';
import { TenantStatsCards } from './TenantStatsCards';
import { TenantFilters } from './TenantFilters';
import { TenantTable } from './TenantTable';
import { CreateTenantModal } from './CreateTenantModal';
import { EditTenantModal } from './EditTenantModal';

export function TenantManagement() {
    const navigate = useNavigate();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TenantStatus | 'ALL'>('ALL');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

    const fetchTenants = useCallback(async () => {
        setLoading(true);
        try {
            const response = await tenantService.getAllTenants();
            setTenants(response.data);
        } catch (error) {
            console.error('Failed to fetch tenants:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    // Derived state using useMemo - replaces useEffect anti-pattern
    const filteredTenants = useMemo(() => {
        let filtered = tenants;

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(t => t.status === statusFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(query) ||
                (t.description && t.description.toLowerCase().includes(query)) ||
                t.id.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [tenants, statusFilter, searchQuery]);

    // Stable callbacks using useCallback
    const handleCreateSuccess = useCallback(() => {
        setIsCreateModalOpen(false);
        fetchTenants();
    }, [fetchTenants]);

    const handleEditSuccess = useCallback(() => {
        setEditingTenant(null);
        fetchTenants();
    }, [fetchTenants]);

    const handleDelete = useCallback(async (id: string) => {
        if (confirm('Are you sure you want to delete this tenant?')) {
            try {
                await tenantService.deleteTenant(id);
                fetchTenants();
            } catch (error) {
                console.error('Failed to delete tenant:', error);
                alert('Failed to delete tenant');
            }
        }
    }, [fetchTenants]);

    const handleToggleStatus = useCallback(async (tenant: Tenant) => {
        const newStatus = tenant.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await tenantService.updateTenantStatus(tenant.id, newStatus);
            fetchTenants();
        } catch (error) {
            console.error('Failed to update tenant status:', error);
            alert('Failed to update tenant status');
        }
    }, [fetchTenants]);

    const handleManageKeys = useCallback((tenant: Tenant) => {
        navigate(`/tenants/${tenant.id}?tab=api-keys`);
    }, [navigate]);

    const handleOpenCreateModal = useCallback(() => {
        setIsCreateModalOpen(true);
    }, []);

    const handleCloseCreateModal = useCallback(() => {
        setIsCreateModalOpen(false);
    }, []);

    const handleCloseEditModal = useCallback(() => {
        setEditingTenant(null);
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Tenant Management</h1>
                    <p className="text-text-secondary mt-1">Manage organization tenants and their settings</p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined">add</span>
                    Create Tenant
                </button>
            </div>

            <TenantStatsCards tenants={tenants} />

            <TenantFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
            />

            <TenantTable
                tenants={filteredTenants}
                loading={loading}
                onEdit={setEditingTenant}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onManageKeys={handleManageKeys}
            />

            <CreateTenantModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onSuccess={handleCreateSuccess}
            />

            <EditTenantModal
                isOpen={!!editingTenant}
                onClose={handleCloseEditModal}
                onSuccess={handleEditSuccess}
                tenant={editingTenant}
            />
        </div>
    );
}
