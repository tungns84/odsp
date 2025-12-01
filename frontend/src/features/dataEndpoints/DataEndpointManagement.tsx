import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DataEndpoint } from '../../types/dataEndpoint';
import { dataEndpointService } from '../../services';

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

export const DataEndpointManagement: React.FC = () => {
    const navigate = useNavigate();
    const [endpoints, setEndpoints] = useState<DataEndpoint[]>([]);
    const [filters, setFilters] = useState<EndpointFilters>(initialFilters);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load endpoints from API
    const loadEndpoints = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await dataEndpointService.getAll();
            setEndpoints(response.data);
        } catch (err: any) {
            console.error('Failed to load endpoints:', err);
            setError(err.response?.data?.message || 'Failed to load endpoints. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadEndpoints();
    }, []);

    const filteredEndpoints = endpoints.filter(endpoint => {
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

    const handleClearFilters = () => {
        setFilters(initialFilters);
    };

    const handleView = (id: string) => {
        navigate(`/data-endpoints/${id}`);
    };

    const handleEdit = (id: string) => {
        navigate(`/data-endpoints/${id}/edit`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this endpoint?')) return;

        try {
            await dataEndpointService.delete(id);
            setEndpoints(prev => prev.filter(e => e.id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete endpoint');
        }
    };

    const handleToggleStatus = async (id: string) => {
        const endpoint = endpoints.find(e => e.id === id);
        if (!endpoint) return;

        const newStatus = endpoint.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        try {
            await dataEndpointService.toggleStatus(id, newStatus);
            setEndpoints(prev => prev.map(e =>
                e.id === id ? { ...e, status: newStatus } : e
            ));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

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
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90"
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
                            <p className="text-2xl font-bold text-white">{endpoints.length}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-surface-border-subtle bg-surface p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-4xl text-green-500">check_circle</span>
                        <div>
                            <p className="text-sm text-text-tertiary">Active</p>
                            <p className="text-2xl font-bold text-white">
                                {endpoints.filter(e => e.status === 'ACTIVE').length}
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
                                {endpoints.filter(e => e.status === 'INACTIVE').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 rounded-xl border border-surface-border-subtle bg-surface p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <input
                            type="text"
                            placeholder="Search endpoints..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full rounded-lg border border-surface-border bg-surface-elevated/50 px-4 py-2 text-white placeholder-slate-400 focus:border-primary focus:outline-none"
                        />
                    </div>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="rounded-lg border border-surface-border bg-surface-elevated/50 px-4 py-2 text-white focus:border-primary focus:outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                    <button
                        onClick={handleClearFilters}
                        className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Loading & Error States */}
            {loading && (
                <div className="mb-6 flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            )}

            {error && (
                <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-500">
                    {error}
                </div>
            )}

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
                                                    <button
                                                        onClick={() => handleView(endpoint.id)}
                                                        className="rounded-lg p-2 text-text-tertiary hover:bg-surface-elevated-hover hover:text-text-primary"
                                                        title="View"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(endpoint.id)}
                                                        className="rounded-lg p-2 text-text-tertiary hover:bg-surface-elevated-hover hover:text-text-primary"
                                                        title="Edit"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(endpoint.id)}
                                                        className="rounded-lg p-2 text-text-tertiary hover:bg-surface-elevated-hover hover:text-text-primary"
                                                        title={endpoint.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                    >
                                                        <span className="material-symbols-outlined text-lg">
                                                            {endpoint.status === 'ACTIVE' ? 'pause_circle' : 'play_circle'}
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(endpoint.id)}
                                                        className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                                        title="Delete"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
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
