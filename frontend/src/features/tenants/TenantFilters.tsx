import React from 'react';
import { Search } from 'lucide-react';
import type { TenantStatus } from '../../types/tenantTypes';

interface Props {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    statusFilter: TenantStatus | 'ALL';
    onStatusFilterChange: (status: TenantStatus | 'ALL') => void;
}

export function TenantFilters({ searchQuery, onSearchChange, statusFilter, onStatusFilterChange }: Props) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                <input
                    type="text"
                    placeholder="Search tenants..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-border bg-surface text-text-primary focus:border-primary focus:outline-none"
                />
            </div>
            <div className="flex gap-2">
                <select
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value as TenantStatus | 'ALL')}
                    className="px-4 py-2 rounded-lg border border-surface-border bg-surface text-text-primary focus:border-primary focus:outline-none"
                >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
            </div>
        </div>
    );
}
