import React from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
import type { Tenant } from '../../types/tenantTypes';

interface Props {
    tenants: Tenant[];
}

export function TenantStatsCards({ tenants }: Props) {
    const total = tenants.length;
    const active = tenants.filter(t => t.status === 'ACTIVE').length;
    const inactive = tenants.filter(t => t.status === 'INACTIVE').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface border border-surface-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-text-secondary text-sm font-medium">Total Tenants</p>
                        <p className="text-2xl font-bold text-text-primary mt-2">{total}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                        <Users className="text-blue-500" size={24} />
                    </div>
                </div>
            </div>

            <div className="bg-surface border border-surface-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-text-secondary text-sm font-medium">Active Tenants</p>
                        <p className="text-2xl font-bold text-text-primary mt-2">{active}</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg">
                        <UserCheck className="text-green-500" size={24} />
                    </div>
                </div>
            </div>

            <div className="bg-surface border border-surface-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-text-secondary text-sm font-medium">Inactive Tenants</p>
                        <p className="text-2xl font-bold text-text-primary mt-2">{inactive}</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-lg">
                        <UserX className="text-red-500" size={24} />
                    </div>
                </div>
            </div>
        </div>
    );
}
