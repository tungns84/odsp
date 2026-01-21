import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDataEndpoints } from '../../hooks/useDataEndpoints';
import { workflowService } from '../../services/workflowService';

interface EndpointFilters {
    search: string;
    connectorId: string;
    status: string;
    createdDate: string;
}

const initialFilters: EndpointFilters = {
    search: '',
    connectorId: '',
    status: '',
    createdDate: ''
};

interface PendingAction {
    id: string;
    type: 'delete' | 'toggle' | 'publish';
}

export const DataEndpointManagement: React.FC = () => {
    const navigate = useNavigate();
    const { endpoints, loading, error, refresh, deleteEndpoint, toggleStatus } = useDataEndpoints();
    const [filters, setFilters] = useState<EndpointFilters>(initialFilters);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    // Memoize filtered endpoints to avoid recalculation
    const filteredEndpoints = useMemo(() => {
        return endpoints.filter(endpoint => {
            if (filters.search && !endpoint.name.toLowerCase().includes(filters.search.toLowerCase()) &&
                !endpoint.description?.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }
            if (filters.connectorId && endpoint.connectorId !== filters.connectorId) {
                return false;
            }
            if (filters.status && endpoint.status !== filters.status) {
                return false;
            }
            if (filters.createdDate && endpoint.createdAt !== filters.createdDate) {
                return false;
            }
            return true;
        });
    }, [endpoints, filters]);

    // Memoize stats to avoid multiple filter calls
    const stats = useMemo(() => ({
        total: endpoints.length,
        active: endpoints.filter(e => e.status === 'ACTIVE').length,
        inactive: endpoints.filter(e => e.status === 'INACTIVE').length,
    }), [endpoints]);

    const handleClearFilters = useCallback(() => {
        setFilters(initialFilters);
    }, []);

    const handleView = useCallback((id: string) => {
        navigate(`/data-endpoints/${id}`);
    }, [navigate]);

    const handleEdit = useCallback((id: string) => {
        navigate(`/data-endpoints/${id}/edit`);
    }, [navigate]);

    const handleDelete = useCallback(async (id: string) => {
        if (!confirm('Are you sure you want to delete this endpoint?')) return;

        setPendingAction({ id, type: 'delete' });
        setActionError(null);
        try {
            await deleteEndpoint(id);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete endpoint';
            setActionError(message);
        } finally {
            setPendingAction(null);
        }
    }, [deleteEndpoint]);

    const handleToggleStatus = useCallback(async (id: string) => {
        setPendingAction({ id, type: 'toggle' });
        setActionError(null);
        try {
            await toggleStatus(id);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update status';
            setActionError(message);
        } finally {
            setPendingAction(null);
        }
    }, [toggleStatus]);

    const handleRequestPublish = useCallback(async (id: string, _name: string) => {
        const tenantId = localStorage.getItem('tenantId') || 'default-tenant';
        setPendingAction({ id, type: 'publish' });
        setActionError(null);
        try {
            await workflowService.startProcess('endpoint-publishing', {
                endpointId: id,
                tenantId,
            });
            // Success feedback inline instead of alert
            refresh(); // Refresh to show updated state
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit publishing request';
            setActionError(message);
        } finally {
            setPendingAction(null);
        }
    }, [refresh]);

    const isActionPending = (id: string) => pendingAction?.id === id;

    const getStatusBadge = (status: string) => {
        const styles = {
            ACTIVE: 'bg-green-500/10 text-green-500 border-green-500/20',
            INACTIVE: 'bg-slate-500/10 text-text-tertiary border-slate-500/20'
        };
        return (
            <span className={`rounded-lg border px-3 py-1 text-xs font-medium ${styles[status as keyof typeof styles]}`}>
                {status === 'ACTIVE' ? 'Active' : 'Inactive'}
            </span>
        );
    };

    return (
        <>
            {/* Page Heading */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Data Endpoints</h1>
                <button
                    onClick={() => navigate('/data-endpoints/create')}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    New Endpoint
                </button>
            </div>

            {/* Stats */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-surface-border-subtle bg-surface p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-4xl text-primary">dns</span>
                        <div>
                            <p className="text-sm text-text-tertiary">Total Endpoints</p>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-surface-border-subtle bg-surface p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-4xl text-green-500">check_circle</span>
                        <div>
                            <p className="text-sm text-text-tertiary">Active</p>
                            <p className="text-2xl font-bold text-white">
                                {stats.active}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-surface-border-subtle bg-surface p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-4xl text-text-tertiary">pause_circle</span>
                        <div>
                            <p className="text-sm text-text-tertiary">Inactive</p>
                            <p className="text-2xl font-bold text-white">
                                {stats.inactive}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 rounded-xl border border-surface-border-subtle bg-surface p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <label htmlFor="endpoint-search" className="sr-only">Search endpoints</label>
                        <input
                            id="endpoint-search"
                            type="text"
                            placeholder="Search endpoints..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full rounded-lg border border-surface-border bg-surface-elevated/50 px-4 py-2 text-white placeholder-slate-400 focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="endpoint-status-filter" className="sr-only">Filter by status</label>
                        <select
                            id="endpoint-status-filter"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="rounded-lg border border-surface-border bg-surface-elevated/50 px-4 py-2 text-white focus:border-primary focus:outline-none"
                        >
                            <option value="">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                    <button
                        onClick={handleClearFilters}
                        className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Loading & Error States */}
            {loading ? (
                <div className="mb-6 flex justify-center py-8" aria-live="polite" role="status">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden="true"></div>
                    <span className="sr-only">Loading endpoints…</span>
                </div>
            ) : null}

            {error ? (
                <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-500 flex items-center justify-between" role="alert">
                    <span>{error}</span>
                    <button
                        onClick={refresh}
                        className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                        Retry
                    </button>
                </div>
            ) : null}

            {/* Action Error */}
            {actionError ? (
                <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-500 flex items-center justify-between" role="alert">
                    <span>{actionError}</span>
                    <button
                        onClick={() => setActionError(null)}
                        className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30"
                    >
                        Dismiss
                    </button>
                </div>
            ) : null}

            {/* Table */}
            {!loading && !error && (
                <div className="rounded-xl border border-surface-border-subtle bg-surface shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-surface-border">
                                    <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary">Description</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary">Route</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-text-tertiary">Created</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-text-tertiary">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEndpoints.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-text-tertiary">
                                            No endpoints found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEndpoints.map((endpoint) => (
                                        <tr key={endpoint.id} className="border-b border-surface-border/50 hover:bg-surface-elevated/30">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{endpoint.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-text-secondary">{endpoint.description || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="rounded bg-surface-elevated px-2 py-1 text-xs text-green-400">
                                                    /api/{endpoint.name}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(endpoint.status)}</td>
                                            <td className="px-6 py-4 text-sm text-text-secondary">{endpoint.createdAt}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {endpoint.status === 'INACTIVE' && (
                                                        <button
                                                            onClick={() => handleRequestPublish(endpoint.id, endpoint.name)}
                                                            disabled={isActionPending(endpoint.id)}
                                                            className="rounded-lg p-2 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            aria-label="Request publish"
                                                            title="Request Publish"
                                                        >
                                                            {isActionPending(endpoint.id) && pendingAction?.type === 'publish' ? (
                                                                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                                            ) : (
                                                                <span className="material-symbols-outlined text-lg">publish</span>
                                                            )}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleView(endpoint.id)}
                                                        className="rounded-lg p-2 text-text-tertiary hover:bg-surface-elevated-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                                        aria-label="View endpoint details"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(endpoint.id)}
                                                        className="rounded-lg p-2 text-text-tertiary hover:bg-surface-elevated-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                                        aria-label="Edit endpoint"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(endpoint.id)}
                                                        disabled={isActionPending(endpoint.id)}
                                                        className="rounded-lg p-2 text-text-tertiary hover:bg-surface-elevated-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                                        aria-label={endpoint.status === 'ACTIVE' ? 'Deactivate endpoint' : 'Activate endpoint'}
                                                    >
                                                        {isActionPending(endpoint.id) && pendingAction?.type === 'toggle' ? (
                                                            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                                        ) : (
                                                            <span className="material-symbols-outlined text-lg">
                                                                {endpoint.status === 'ACTIVE' ? 'pause_circle' : 'play_circle'}
                                                            </span>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(endpoint.id)}
                                                        disabled={isActionPending(endpoint.id)}
                                                        className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        aria-label="Delete endpoint"
                                                    >
                                                        {isActionPending(endpoint.id) && pendingAction?.type === 'delete' ? (
                                                            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                                        ) : (
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
};
