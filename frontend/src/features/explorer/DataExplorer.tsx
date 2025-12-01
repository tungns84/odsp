import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { dataEndpointService } from '../../services';
import type { DataEndpoint } from '../../types/dataEndpoint';

export const DataExplorer: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const endpointIdParam = searchParams.get('endpointId');

    const [endpoints, setEndpoints] = useState<DataEndpoint[]>([]);
    const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(endpointIdParam);

    const [data, setData] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [loadingEndpoints, setLoadingEndpoints] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Load available endpoints
    useEffect(() => {
        const fetchEndpoints = async () => {
            setLoadingEndpoints(true);
            try {
                const response = await dataEndpointService.getAll();
                setEndpoints(response.data);
            } catch (err) {
                console.error('Failed to load endpoints:', err);
                setError('Failed to load available data endpoints.');
            } finally {
                setLoadingEndpoints(false);
            }
        };
        fetchEndpoints();
    }, []);

    // Update URL when selection changes
    useEffect(() => {
        if (selectedEndpointId) {
            setSearchParams({ endpointId: selectedEndpointId });
        } else {
            setSearchParams({});
        }
    }, [selectedEndpointId, setSearchParams]);

    // Fetch data when endpoint or pagination changes
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedEndpointId) {
                setData([]);
                setColumns([]);
                setTotalElements(0);
                return;
            }

            // Ensure page is a valid number
            const validPage = isNaN(page) || page < 0 ? 0 : Math.floor(page);
            const validPageSize = isNaN(pageSize) || pageSize <= 0 ? 10 : Math.floor(pageSize);

            // Reset page if it became invalid
            if (validPage !== page) {
                setPage(validPage);
                return;
            }

            setLoadingData(true);
            setError(null);
            try {
                const response = await dataEndpointService.queryData(selectedEndpointId, validPage, validPageSize);
                const responseData = response.data;

                setData(responseData.data);
                setTotalElements(responseData.totalElements);
                setTotalPages(responseData.totalPages);

                // Extract columns from first row if available, otherwise empty
                if (responseData.data.length > 0) {
                    setColumns(Object.keys(responseData.data[0]));
                } else {
                    setColumns([]);
                }
            } catch (err: any) {
                console.error('Failed to query data:', err);
                setError(err.response?.data?.message || 'Failed to fetch data. Ensure the endpoint is active and query is valid.');
                setData([]);
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [selectedEndpointId, page, pageSize]);

    // Reset pagination when endpoint changes
    const handleEndpointChange = (id: string) => {
        setSelectedEndpointId(id);
        setPage(0);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Data Explorer</h1>
                    <p className="text-text-tertiary">Query and analyze data from your registered endpoints</p>
                </div>

                {/* Endpoint Selector */}
                <div className="w-full md:w-72">
                    <select
                        value={selectedEndpointId || ''}
                        onChange={(e) => handleEndpointChange(e.target.value)}
                        className="w-full rounded-lg border border-surface-border bg-surface-elevated px-4 py-2 text-text-primary focus:border-primary focus:outline-none"
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
                <div className="rounded-lg bg-red-500/10 p-4 text-red-400 border border-red-500/20 flex items-center gap-2">
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
                                {totalElements} results found
                            </span>
                            {loadingData && <span className="material-symbols-outlined animate-spin text-primary text-sm">sync</span>}
                        </div>
                        <div className="flex items-center gap-4">
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(0);
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
                            Page {page + 1} of {totalPages || 1}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0 || loadingData}
                                className="rounded px-3 py-1 text-xs font-medium text-text-secondary hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={loadingData || (totalPages > 0 && page >= totalPages - 1)}
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
};
