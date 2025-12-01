import React, { useEffect, useState } from 'react';
import { tenantService } from '../../services/tenantService';
import type { Tenant } from '../../types/tenantTypes';

export const TenantSelector: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [currentTenant, setCurrentTenant] = useState<string>('default-tenant');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const response = await tenantService.getAllTenants();
                setTenants(response.data);

                // If no tenants, we might want to handle that, but for now let's assume at least one exists
                // or keep the stored one if it's valid
            } catch (error) {
                console.error('Failed to fetch tenants:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTenants();

        const stored = localStorage.getItem('tenantId');
        if (stored) {
            setCurrentTenant(stored);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        setCurrentTenant(newValue);
        localStorage.setItem('tenantId', newValue);
        // Reload to ensure all API calls use the new tenant
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-text-tertiary">Tenant</label>
                <div className="h-7 w-full rounded bg-surface-elevated animate-pulse" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-tertiary">Tenant</label>
            <select
                value={currentTenant}
                onChange={handleChange}
                className="w-full rounded bg-surface-elevated px-2 py-1 text-xs text-text-secondary border border-surface-border focus:border-primary focus:outline-none"
            >
                {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                        {tenant.name}
                    </option>
                ))}
            </select>
        </div>
    );
};
