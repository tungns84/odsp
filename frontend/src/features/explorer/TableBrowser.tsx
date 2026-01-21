import { useState, useEffect } from 'react';
import { Search, Database, Table2, Eye } from 'lucide-react';
import { connectorService } from '../../services/connectorService';
import type { ConnectorSummary, TableMetadata } from '../../types/connectorTypes';

interface TableBrowserProps {
    onTableSelect?: (connectorId: string, tableName: string) => void;
}

export function TableBrowser({ onTableSelect }: TableBrowserProps) {
    const [connectors, setConnectors] = useState<ConnectorSummary[]>([]);
    const [selectedConnectorId, setSelectedConnectorId] = useState<string>('');
    const [tables, setTables] = useState<TableMetadata[]>([]);
    const [filteredTables, setFilteredTables] = useState<TableMetadata[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewTable, setPreviewTable] = useState<TableMetadata | null>(null);

    // Fetch connectors on mount
    useEffect(() => {
        const fetchConnectors = async () => {
            try {
                const response = await connectorService.getAll();
                setConnectors(response.data.filter(c => c.status === 'APPROVED'));
            } catch (err: any) {
                setError('Failed to load connectors');
            }
        };
        fetchConnectors();
    }, []);

    // Fetch tables when connector changes
    useEffect(() => {
        if (selectedConnectorId) {
            fetchTables(selectedConnectorId);
        } else {
            setTables([]);
            setFilteredTables([]);
        }
    }, [selectedConnectorId]);

    // Filter tables based on search query
    useEffect(() => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            setFilteredTables(
                tables.filter(table =>
                    table.name.toLowerCase().includes(query) ||
                    table.displayName?.toLowerCase().includes(query)
                )
            );
        } else {
            setFilteredTables(tables);
        }
    }, [searchQuery, tables]);

    const fetchTables = async (connectorId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await connectorService.getTables(connectorId);
            setTables(response.data);
            setFilteredTables(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch tables');
            setTables([]);
            setFilteredTables([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTableClick = (table: TableMetadata) => {
        setPreviewTable(table);
    };

    const handleTableSelect = (table: TableMetadata) => {
        if (onTableSelect && selectedConnectorId) {
            onTableSelect(selectedConnectorId, table.name);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-text-primary">Table Browser</h2>
                <p className="text-sm text-text-tertiary">Browse and explore tables from your data sources</p>
            </div>

            {/* Connector Selection */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-secondary">Select Data Source</label>
                <select
                    value={selectedConnectorId}
                    onChange={(e) => setSelectedConnectorId(e.target.value)}
                    className="w-full rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-focus-ring"
                >
                    <option value="">Choose a connector...</option>
                    {connectors.map(connector => (
                        <option key={connector.id} value={connector.id}>
                            {connector.name} ({connector.type})
                        </option>
                    ))}
                </select>
            </div>

            {/* Search */}
            {selectedConnectorId && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tables..."
                        className="w-full rounded-lg border border-surface-border bg-surface-elevated pl-10 pr-4 py-2 text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-focus-ring"
                    />
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="rounded-lg bg-error-bg border border-error-border p-3 text-sm text-error flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {error}
                </div>
            )}

            {/* Tables Grid */}
            {selectedConnectorId && (
                <div className="rounded-lg border border-surface-border bg-surface overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                            <span className="ml-2 text-text-secondary">Loading tables...</span>
                        </div>
                    ) : filteredTables.length > 0 ? (
                        <div className="divide-y divide-surface-border max-h-[500px] overflow-y-auto">
                            {filteredTables.map((table) => (
                                <div
                                    key={table.name}
                                    className="p-4 hover:bg-surface-elevated transition-colors cursor-pointer"
                                    onClick={() => handleTableClick(table)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="mt-0.5 text-primary">
                                                <Table2 size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-text-primary">
                                                        {table.displayName || table.name}
                                                    </h3>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-surface-elevated text-text-tertiary">
                                                        {table.columns.length} columns
                                                    </span>
                                                </div>
                                                {table.columns && table.columns.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {table.columns.slice(0, 5).map((col) => (
                                                            <span
                                                                key={col.name}
                                                                className="text-xs px-2 py-0.5 rounded bg-surface-card border border-surface-border text-text-secondary"
                                                            >
                                                                {col.displayName || col.name}
                                                                <span className="text-text-tertiary ml-1">: {col.dataType}</span>
                                                            </span>
                                                        ))}
                                                        {table.columns.length > 5 && (
                                                            <span className="text-xs px-2 py-0.5 text-text-tertiary">
                                                                +{table.columns.length - 5} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTableSelect(table);
                                            }}
                                            className="ml-3 flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded transition-colors"
                                        >
                                            <Eye size={14} />
                                            Select
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-text-tertiary">
                            <Database size={48} className="mb-3 opacity-50" />
                            <p className="text-sm">
                                {searchQuery ? 'No tables match your search' : 'No tables found'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!selectedConnectorId && (
                <div className="rounded-lg border border-dashed border-surface-border p-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
                        <Database size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-text-primary">Select a Data Source</h3>
                    <p className="mt-1 text-sm text-text-tertiary">
                        Choose a connector above to browse its tables
                    </p>
                </div>
            )}

            {/* Preview Modal */}
            {previewTable && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-lg border border-surface-border bg-surface p-6 shadow-xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-semibold text-text-primary">
                                    {previewTable.displayName || previewTable.name}
                                </h3>
                                {previewTable.displayName && (
                                    <p className="text-sm text-text-tertiary mt-1">Table: {previewTable.name}</p>
                                )}
                            </div>
                            <button
                                onClick={() => setPreviewTable(null)}
                                className="text-text-secondary hover:text-text-primary"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Columns */}
                            <div className="p-4 rounded-lg bg-surface-elevated">
                                <p className="text-sm font-medium text-text-secondary mb-3">
                                    Columns ({previewTable.columns.length})
                                </p>
                                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                                    {previewTable.columns.map((col) => (
                                        <div
                                            key={col.name}
                                            className="flex items-center justify-between text-sm p-2 rounded bg-surface hover:bg-surface-card transition-colors"
                                        >
                                            <div className="flex-1">
                                                <span className="font-medium text-text-primary">
                                                    {col.displayName || col.name}
                                                </span>
                                                {col.displayName && (
                                                    <span className="text-xs text-text-tertiary ml-2">({col.name})</span>
                                                )}
                                                {col.isPrimaryKey && (
                                                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">PK</span>
                                                )}
                                            </div>
                                            <span className="text-text-tertiary">{col.dataType}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setPreviewTable(null)}
                                    className="px-4 py-2 rounded-lg border border-surface-border text-text-secondary hover:bg-surface-elevated transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        handleTableSelect(previewTable);
                                        setPreviewTable(null);
                                    }}
                                    className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
                                >
                                    Select Table
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
