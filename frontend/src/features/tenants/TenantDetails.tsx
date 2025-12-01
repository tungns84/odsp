import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { tenantService } from '../../services/tenantService';
import type { Tenant } from '../../types/tenantTypes';
import { ApiKeyManagement } from './ApiKeyManagement';

export function TenantDetails() {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

    useEffect(() => {
        const fetchTenant = async () => {
            if (!id) return;
            try {
                const response = await tenantService.getTenantById(id);
                setTenant(response.data);
            } catch (error) {
                console.error('Failed to fetch tenant:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTenant();
    }, [id]);

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    if (!tenant) {
        return <div className="p-6">Tenant not found</div>;
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary">{tenant.name}</h1>
                <p className="text-text-secondary mt-1">{tenant.description}</p>
            </div>

            <div className="border-b border-surface-border mb-6">
                <nav className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'overview'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('api-keys')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'api-keys'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        API Keys
                    </button>
                </nav>
            </div>

            {activeTab === 'overview' && (
                <div className="bg-surface border border-surface-border rounded-lg p-6">
                    <h3 className="text-lg font-medium text-text-primary mb-4">Tenant Information</h3>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-text-secondary">ID</dt>
                            <dd className="mt-1 text-sm text-text-primary">{tenant.id}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-text-secondary">Status</dt>
                            <dd className="mt-1 text-sm text-text-primary">{tenant.status}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-text-secondary">Created At</dt>
                            <dd className="mt-1 text-sm text-text-primary">
                                {new Date(tenant.createdAt).toLocaleString()}
                            </dd>
                        </div>
                    </dl>
                </div>
            )}

            {activeTab === 'api-keys' && (
                <ApiKeyManagement tenantId={tenant.id} />
            )}
        </div>
    );
}
