import { useState } from 'react';
import { TableBrowser } from './TableBrowser';
import { QueryBuilder } from './QueryBuilder';
import { QueryResultsTable } from './components/QueryResultsTable';
import { connectorService, dataEndpointService } from '../../services';
import type { TableMetadata } from '../../types/connectorTypes';

export function AdHocQueryView() {
    const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);
    const [selectedTable, setSelectedTable] = useState<TableMetadata | null>(null);
    const [queryResults, setQueryResults] = useState<{
        columns: string[];
        rows: Record<string, any>[];
        rowCount: number;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // When user selects a table from TableBrowser
    const handleTableSelect = async (connectorId: string, tableName: string) => {
        setSelectedConnectorId(connectorId);
        setError(null);

        try {
            // Fetch table metadata to get columns
            const response = await connectorService.getTables(connectorId);
            const table = response.data.find(t => t.name === tableName);

            if (table) {
                setSelectedTable(table);
                // Reset previous results when changing table
                setQueryResults(null);
            } else {
                setError(`Table ${tableName} not found`);
            }
        } catch (err: any) {
            setError('Failed to load table metadata');
            console.error(err);
        }
    };

    // Execute query
    const handleExecuteQuery = async (queryConfig: any) => {
        if (!selectedConnectorId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await dataEndpointService.testQuery({
                connectorId: selectedConnectorId,
                queryConfig
            });

            setQueryResults({
                columns: response.data.columns,
                rows: response.data.rows,
                rowCount: response.data.rowCount
            });
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Query failed');
            setQueryResults(null);
        } finally {
            setLoading(false);
        }
    };

    // TODO: Implement save as endpoint
    const handleSaveAsEndpoint = () => {
        alert('Save as Endpoint feature coming soon!');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel: Table Browser */}
            <div className="lg:col-span-1">
                <div className="rounded-xl border border-surface-border bg-surface p-4 sticky top-6">
                    <TableBrowser onTableSelect={handleTableSelect} />
                </div>
            </div>

            {/* Right Panel: Query Builder & Results */}
            <div className="lg:col-span-2 space-y-6">
                {/* Query Builder */}
                <div className="rounded-xl border border-surface-border bg-surface p-6">
                    <QueryBuilder
                        table={selectedTable}
                        onExecute={handleExecuteQuery}
                        onSave={handleSaveAsEndpoint}
                        loading={loading}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="rounded-lg bg-error-bg border border-error-border p-4 text-error flex items-center gap-2">
                        <span className="material-symbols-outlined">error</span>
                        {error}
                    </div>
                )}

                {/* Query Results */}
                {queryResults && (
                    <QueryResultsTable
                        columns={queryResults.columns}
                        rows={queryResults.rows}
                        rowCount={queryResults.rowCount}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
}
