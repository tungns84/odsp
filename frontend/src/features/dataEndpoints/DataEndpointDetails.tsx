import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { DataEndpoint } from '../../types/dataEndpointTypes';
import { dataEndpointService } from '../../services';

interface PendingAction {
    type: 'test' | 'toggle' | 'delete';
}

export const DataEndpointDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [endpoint, setEndpoint] = useState<DataEndpoint | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<{ columns: string[]; rows: Record<string, any>[] } | null>(null);

    // Unified pending state and action error
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const loadEndpoint = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            const response = await dataEndpointService.getById(id);
            setEndpoint(response.data);
        } catch (err: unknown) {
            console.error('Failed to load endpoint:', err);
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load endpoint details';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadEndpoint();
    }, [loadEndpoint]);

    const handleTestEndpoint = useCallback(async () => {
        if (!endpoint || !endpoint.connector || !endpoint.queryConfig) {
            setActionError('Missing connector or query configuration');
            return;
        }

        setPendingAction({ type: 'test' });
        setActionError(null);
        setTestResult(null);

        try {
            const response = await dataEndpointService.testQuery({
                connectorId: endpoint.connector.id,
                queryConfig: endpoint.queryConfig
            });

            setTestResult({
                columns: response.data.columns,
                rows: response.data.rows
            });
        } catch (err: unknown) {
            console.error('Test failed:', err);
            const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
            const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
            setActionError(code || errorMsg || 'Failed to test endpoint');
        } finally {
            setPendingAction(null);
        }
    }, [endpoint]);

    const handleToggleStatus = useCallback(async () => {
        if (!endpoint) return;

        const newStatus = endpoint.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        setPendingAction({ type: 'toggle' });
        setActionError(null);

        try {
            await dataEndpointService.toggleStatus(endpoint.id, newStatus);
            setEndpoint({ ...endpoint, status: newStatus });
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update status';
            setActionError(message);
        } finally {
            setPendingAction(null);
        }
    }, [endpoint]);

    const handleDelete = useCallback(async () => {
        if (!endpoint || !confirm('Are you sure you want to delete this endpoint?')) return;

        setPendingAction({ type: 'delete' });
        setActionError(null);

        try {
            await dataEndpointService.delete(endpoint.id);
            navigate('/data-endpoints');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete endpoint';
            setActionError(message);
            setPendingAction(null);
        }
    }, [endpoint, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12" aria-live="polite" role="status">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden="true" />
                <span className="sr-only">Loading endpoint details…</span>
            </div>
        );
    }

    if (error || !endpoint) {
        return (
            <div className="space-y-4">
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-500" role="alert">
                    {error || 'Endpoint not found'}
                </div>
                <button
                    onClick={() => navigate('/data-endpoints')}
                    className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated"
                >
                    Back to List
                </button>
            </div>
        );
    }

    const isPending = (type: PendingAction['type']) => pendingAction?.type === type;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/data-endpoints')}
                        className="rounded-lg p-2 text-text-tertiary hover:bg-surface-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label="Back to endpoints list"
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

            {/* Action Error */}
            {actionError ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-500 flex items-center justify-between" role="alert">
                    <span>{actionError}</span>
                    <button
                        onClick={() => setActionError(null)}
                        className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                        Dismiss
                    </button>
                </div>
            ) : null}

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={handleTestEndpoint}
                    disabled={isPending('test')}
                    className="flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending('test') ? (
                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    ) : (
                        <span className="material-symbols-outlined text-lg">play_arrow</span>
                    )}
                    Test Query
                </button>
                <button
                    onClick={handleToggleStatus}
                    disabled={isPending('toggle')}
                    className="flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending('toggle') ? (
                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    ) : (
                        <span className="material-symbols-outlined text-lg">
                            {endpoint.status === 'ACTIVE' ? 'pause_circle' : 'play_circle'}
                        </span>
                    )}
                    {endpoint.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                    onClick={() => navigate(`/data-endpoints/${endpoint.id}/edit`)}
                    className="flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Edit
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isPending('delete')}
                    className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending('delete') ? (
                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    ) : (
                        <span className="material-symbols-outlined text-lg">delete</span>
                    )}
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
                            <p className="text-sm text-white">{endpoint.connector?.name || 'Unknown Connector'}</p>
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
