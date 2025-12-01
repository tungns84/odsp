import React from 'react';
import { Edit, Trash2, Power, Key } from 'lucide-react';
import type { Tenant } from '../../types/tenantTypes';
import { TenantStatusBadge } from './TenantStatusBadge';

interface Props {
    tenants: Tenant[];
    loading: boolean;
    onEdit: (tenant: Tenant) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (tenant: Tenant) => void;
    onManageKeys: (tenant: Tenant) => void;
}

export function TenantTable({ tenants, loading, onEdit, onDelete, onToggleStatus, onManageKeys }: Props) {
    if (loading) {
        return (
            <div className="bg-surface border border-surface-border rounded-lg p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-text-secondary mt-4">Loading tenants...</p>
            </div>
        );
    }

    if (tenants.length === 0) {
        return (
            <div className="bg-surface border border-surface-border rounded-lg p-8 text-center">
                <p className="text-text-secondary">No tenants found</p>
            </div>
        );
    }

    return (
        <div className="bg-surface border border-surface-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-surface-elevated border-b border-surface-border">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Created At
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                        {tenants.map((tenant) => (
                            <tr key={tenant.id} className="hover:bg-surface-elevated transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                                    {tenant.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                    {tenant.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-text-secondary max-w-xs truncate" title={tenant.description}>
                                    {tenant.description || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <TenantStatusBadge status={tenant.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                    {new Date(tenant.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onManageKeys(tenant)}
                                            className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-blue-500"
                                            title="Manage API Keys"
                                        >
                                            <Key size={18} />
                                        </button>
                                        <button
                                            onClick={() => onEdit(tenant)}
                                            className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-primary"
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => onToggleStatus(tenant)}
                                            className={`p-2 hover:bg-surface-elevated rounded-lg transition-colors ${tenant.status === 'ACTIVE' ? 'text-yellow-500' : 'text-green-500'
                                                }`}
                                            title={tenant.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                        >
                                            <Power size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(tenant.id)}
                                            className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-red-500"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
