import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDataEndpoints } from '../../hooks/useDataEndpoints';
import { useDataQuery } from '../../hooks/useDataQuery';

/**
 * SavedEndpointsView - Display and query pre-configured data endpoints
 * This is the original Data Explorer functionality extracted into a component
 */
export function SavedEndpointsView() {
    const [searchParams, setSearchParams] = useSearchParams();
    const endpointIdParam = searchParams.get('endpointId');

    const { endpoints, loading: loadingEndpoints, error: endpointsError } = useDataEndpoints();
    const {
        data,
        columns,
        loading: loadingData,
        error: queryError,
        pagination,
        fetchData,
        setPage,
        setPageSize,
        reset
    } = useDataQuery();

    const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(endpointIdParam);
    const [error, setError] = useState<string | null>(null);

    // Update error state if endpoints fail to load or query fails
    useEffect(() => {
        if (endpointsError) {
            setError(endpointsError);
        } else if (queryError) {
            setError(queryError);
        } else {
            setError(null);
        }
    }, [endpointsError, queryError]);

    // Update URL when selection changes
    useEffect(() => {
        if (selectedEndpointId) {
            setSearchParams({ mode: 'endpoints', endpointId: selectedEndpointId });
        } else {
            setSearchParams({ mode: 'endpoints' });
            reset();
        }
    }, [selectedEndpointId, setSearchParams, reset]);

    // Fetch data when endpoint or pagination changes
    useEffect(() => {
        if (selectedEndpointId) {
            fetchData(selectedEndpointId, pagination.page, pagination.pageSize);
        }
    }, [selectedEndpointId, pagination.page, pagination.pageSize, fetchData]);

    // Reset pagination when endpoint changes
    const handleEndpointChange = (id: string) => {
        setSelectedEndpointId(id);
        reset();
    };

    return (
        <div className="space-y-6">
            {/* Endpoint Selector */}
            <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-text-secondary">Select Endpoint:</label>
                <div className="flex-1 max-w-md">
                    <select
                        value={selectedEndpointId || ''}
                        onChange={(e) => handleEndpointChange(e.target.value)}
                        className="w-full rounded-lg border border-surface-border bg-surface-elevated px-4 py-2 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-focus-ring"
                        disabled={loadingEndpoints}
                    >
                        <option value="">Select an endpoint...</option>
                        {endpoints.map(ep => (
                            <option key={ep.id} value={ep.id}>
                                {ep.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-lg bg-error-bg border border-error-border p-4 text-error flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}

            {/* Data Table */}
            {selectedEndpointId && (
                <div className="rounded-xl border border-surface-border bg-surface shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="border-b border-surface-border px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-secondary">
                                {pagination.totalElements} results found
                            </span>
                            {loadingData && <span className="material-symbols-outlined animate-spin text-primary text-sm">sync</span>}
                        </div>
                        <div className="flex items-center gap-4">
                            <select
                                value={pagination.pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                }}
                                className="rounded border border-surface-border bg-surface-elevated px-2 py-1 text-xs text-text-secondary focus:border-primary focus:outline-none"
                            >
                                <option value={10}>10 / page</option>
                                <option value={20}>20 / page</option>
                                <option value={50}>50 / page</option>
                                <option value={100}>100 / page</option>
                            </select>

                            <button
                                onClick={() => setPage(0)} // Trigger re-fetch
                                className="p-2 text-text-tertiary hover:text-primary transition-colors"
                                title="Refresh"
                            >
                                <span className="material-symbols-outlined">refresh</span>
                            </button>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-surface-elevated text-xs uppercase text-text-secondary">
                                <tr>
                                    {columns.length > 0 ? (
                                        columns.map(col => (
                                            <th key={col} className="px-6 py-3 font-medium whitespace-nowrap">
                                                {col}
                                            </th>
                                        ))
                                    ) : (
                                        <th className="px-6 py-3">No columns</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                                {loadingData ? (
                                    // Loading Skeleton
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            {Array.from({ length: Math.max(columns.length, 3) }).map((_, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-4 w-24 rounded bg-surface-elevated"></div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : data.length > 0 ? (
                                    data.map((row, i) => (
                                        <tr key={i} className="hover:bg-surface-elevated/50 transition-colors">
                                            {columns.map(col => (
                                                <td key={col} className="px-6 py-4 text-text-secondary whitespace-nowrap">
                                                    {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="italic text-text-tertiary">null</span>}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={Math.max(columns.length, 1)} className="px-6 py-12 text-center text-text-tertiary">
                                            {loadingData ? 'Loading...' : 'No data available'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="border-t border-surface-border bg-surface-elevated/30 px-6 py-4 flex items-center justify-between">
                        <div className="text-xs text-text-tertiary">
                            Page {pagination.page + 1} of {pagination.totalPages || 1}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(Math.max(0, pagination.page - 1))}
                                disabled={pagination.page === 0 || loadingData}
                                className="rounded px-3 py-1 text-xs font-medium text-text-secondary hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(pagination.page + 1)}
                                disabled={loadingData || (pagination.totalPages > 0 && pagination.page >= pagination.totalPages - 1)}
                                className="rounded px-3 py-1 text-xs font-medium text-text-secondary hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!selectedEndpointId && !loadingEndpoints && (
                <div className="rounded-xl border border-dashed border-surface-border p-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
                        <span className="material-symbols-outlined">search</span>
                    </div>
                    <h3 className="text-lg font-medium text-text-primary">Select an Endpoint</h3>
                    <p className="mt-1 text-text-tertiary">Choose a data endpoint from the list above to start exploring data.</p>
                </div>
            )}
        </div>
    );
}
