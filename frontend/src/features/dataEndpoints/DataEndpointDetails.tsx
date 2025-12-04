import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { DataEndpoint } from '../../types/dataEndpoint';
import { dataEndpointService } from '../../services';

export const DataEndpointDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [endpoint, setEndpoint] = useState<DataEndpoint | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<{ columns: string[]; rows: Record<string, any>[] } | null>(null);
    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        loadEndpoint();
    }, [id]);

    const loadEndpoint = async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            const response = await dataEndpointService.getById(id);
            setEndpoint(response.data);
        } catch (err: any) {
            console.error('Failed to load endpoint:', err);
            setError(err.response?.data?.message || 'Failed to load endpoint details');
        } finally {
            setLoading(false);
        }
    };

    const handleTestEndpoint = async () => {
        if (!endpoint) return;

        setIsTesting(true);
        setTestResult(null);

        try {
            // Parse the queryConfig from the endpoint
            const queryConfig = JSON.parse(endpoint.queryConfig);

            const response = await dataEndpointService.testQuery({
                connectorId: endpoint.connector.id,
                queryConfig
            });

            setTestResult({
                columns: response.data.columns,
                rows: response.data.rows
            });
        } catch (err: any) {
            console.error('Test failed:', err);
            alert(err.response?.data?.code || err.response?.data?.error || 'Failed to test endpoint');
        } finally {
            setIsTesting(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!endpoint) return;

        const newStatus = endpoint.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        try {
            await dataEndpointService.toggleStatus(endpoint.id, newStatus);
            setEndpoint({ ...endpoint, status: newStatus });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDelete = async () => {
        if (!endpoint || !confirm('Are you sure you want to delete this endpoint?')) return;

        try {
            await dataEndpointService.delete(endpoint.id);
            navigate('/data-endpoints');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete endpoint');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (error || !endpoint) {
        return (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-500">
                {error || 'Endpoint not found'}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/data-endpoints')}
                        className="rounded-lg p-2 text-text-tertiary hover:bg-surface-elevated hover:text-text-primary"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{endpoint.name}</h1>
                        <p className="text-sm text-text-tertiary">{endpoint.description || 'No description'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`rounded-lg border px-3 py-1 text-xs font-medium ${endpoint.status === 'ACTIVE'
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : 'bg-slate-500/10 text-text-tertiary border-slate-500/20'
                        }`}>
                        {endpoint.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={handleTestEndpoint}
                    disabled={isTesting}
                    className="flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated disabled:opacity-50"
                >
                    {isTesting ? (
                        <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                    ) : (
                        <span className="material-symbols-outlined text-lg">play_arrow</span>
                    )}
                    Test Query
                </button>
                <button
                    onClick={handleToggleStatus}
                    className="flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated"
                >
                    <span className="material-symbols-outlined text-lg">
                        {endpoint.status === 'ACTIVE' ? 'pause_circle' : 'play_circle'}
                    </span>
                    {endpoint.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                    onClick={() => navigate(`/data-endpoints/${endpoint.id}/edit`)}
                    className="flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated"
                >
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Edit
                </button>
                <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
                >
                    <span className="material-symbols-outlined text-lg">delete</span>
                    Delete
                </button>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* General Information */}
                <div className="rounded-xl border border-surface-border-subtle bg-surface p-6">
                    <h2 className="mb-4 text-lg font-semibold text-white">General Information</h2>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-text-tertiary">Endpoint ID</p>
                            <p className="font-mono text-sm text-white">{endpoint.id}</p>
                        </div>
                        <div>
                            <p className="text-xs text-text-tertiary">API Route</p>
                            <code className="rounded bg-surface-elevated px-2 py-1 text-sm text-green-400">
                                /api/v1/data/{endpoint.pathAlias}
                            </code>
                        </div>
                        <div>
                            <p className="text-xs text-text-tertiary">Connector</p>
                            <p className="text-sm text-white">{endpoint.connector.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-text-tertiary">Allowed Methods</p>
                            <p className="text-sm text-white">{endpoint.allowedMethods}</p>
                        </div>
                        <div>
                            <p className="text-xs text-text-tertiary">Public Access</p>
                            <p className="text-sm text-white">{endpoint.isPublic ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-text-tertiary">Created At</p>
                            <p className="text-sm text-white">{endpoint.createdAt || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Query Information */}
                <div className="rounded-xl border border-surface-border-subtle bg-surface p-6">
                    <h2 className="mb-4 text-lg font-semibold text-white">Query Information</h2>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-text-tertiary">Target Resource</p>
                            <pre className="mt-2 overflow-x-auto rounded bg-surface-elevated p-3 text-xs text-text-secondary">
                                {endpoint.targetResource}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Results */}
            {testResult && (
                <div className="rounded-xl border border-surface-border-subtle bg-surface p-6">
                    <h2 className="mb-4 text-lg font-semibold text-white">Test Results</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-surface-elevated/50">
                                <tr>
                                    {testResult.columns.map((col) => (
                                        <th key={col} className="border-b border-surface-border px-4 py-3 text-left text-xs font-medium text-text-secondary">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {testResult.rows.map((row, idx) => (
                                    <tr key={idx} className="border-b border-surface-border/50 hover:bg-surface-elevated/30">
                                        {testResult.columns.map((col) => (
                                            <td key={col} className="px-4 py-3 text-text-secondary">
                                                {row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
