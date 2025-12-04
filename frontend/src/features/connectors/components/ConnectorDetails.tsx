import React, { useState } from 'react';
import type { Connector, AuditLog } from '../../../types/connector';

interface ConnectorDetailsProps {
    connector: Connector;
    auditLogs: AuditLog[];
    onClose: () => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onTestConnection: (id: string) => void;
    onCreateEndpoint?: (connectorId: string) => void;
}

export const ConnectorDetails: React.FC<ConnectorDetailsProps> = ({
    connector,
    auditLogs,
    onClose,
    onEdit,
    onDelete,
    onApprove,
    onReject,
    onTestConnection,
    onCreateEndpoint
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fullConnector, setFullConnector] = useState<Connector>(connector);
    const [activeTab, setActiveTab] = useState<'config' | 'tables'>('config');
    const [tables, setTables] = useState<import('../../../types/connector').TableMetadata[]>([]);
    const [loadingTables, setLoadingTables] = useState(false);
    const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

    // Fetch full details on mount
    React.useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                const response = await import('../../../services/connectorService').then(m => m.connectorService.getById(connector.id));
                setFullConnector(response.data);
            } catch (error) {
                console.error('Failed to fetch connector details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (connector.id) {
            fetchDetails();
        }
    }, [connector.id]);

    // Fetch tables when tab is active
    React.useEffect(() => {
        const fetchTables = async () => {
            if (activeTab === 'tables' && tables.length === 0 && !loadingTables) {
                setLoadingTables(true);
                try {
                    const response = await import('../../../services/connectorService').then(m => m.connectorService.getTables(connector.id));
                    setTables(response.data);
                } catch (error) {
                    console.error('Failed to fetch tables:', error);
                } finally {
                    setLoadingTables(false);
                }
            }
        };

        fetchTables();
    }, [activeTab, connector.id]);

    const toggleTableExpand = (tableName: string) => {
        const newExpanded = new Set(expandedTables);
        if (newExpanded.has(tableName)) {
            newExpanded.delete(tableName);
        } else {
            newExpanded.add(tableName);
        }
        setExpandedTables(newExpanded);
    };

    // Helper to safely get connector type (backend may return string or object)
    const getConnectorType = (): string => {
        if (typeof fullConnector.type === 'string') {
            return fullConnector.type;
        }
        if (typeof fullConnector.type === 'object' && fullConnector.type !== null) {
            return (fullConnector.type as any).type || 'Unknown';
        }
        return 'Unknown';
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);

        try {
            await import('../../../services/connectorService').then(m => m.connectorService.testConnectionById(connector.id));
            setTestResult({
                success: true,
                message: 'Connection successful!'
            });
            if (onTestConnection) onTestConnection(connector.id);
        } catch (error) {
            console.error('Test connection failed:', error);
            setTestResult({
                success: false,
                message: 'Failed to connect. Please check your configuration.'
            });
        } finally {
            setIsTesting(false);
        }
    };

    const handleDelete = () => {
        onDelete(connector.id);
        setShowDeleteConfirm(false);
        onClose();
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            INIT: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            APPROVED: 'bg-green-500/10 text-green-500 border-green-500/20',
            REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20'
        };
        const labels = {
            INIT: 'Pending Approval',
            APPROVED: 'Active',
            REJECTED: 'Rejected'
        };
        return (
            <span className={`rounded-lg border px-3 py-1 text-sm font-medium ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-4xl rounded-xl border border-surface-border-subtle bg-surface p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{connector.name}</h2>
                        <div className="mt-2">{getStatusBadge(connector.status)}</div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-text-tertiary hover:text-text-primary"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Test Result Message */}
                {testResult && (
                    <div className={`mb-4 rounded-lg p-3 text-sm ${testResult.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">
                                {testResult.success ? 'check_circle' : 'error'}
                            </span>
                            {testResult.message}
                        </div>
                    </div>
                )}

                {/* Info Section */}
                {/* Tabs */}
                <div className="mb-6 border-b border-surface-border">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('config')}
                            className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'config'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-text-tertiary hover:text-text-secondary'
                                }`}
                        >
                            Configuration
                        </button>
                        <button
                            onClick={() => setActiveTab('tables')}
                            className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'tables'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-text-tertiary hover:text-text-secondary'
                                }`}
                        >
                            Registered Tables
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="mb-6 rounded-lg border border-surface-border/50 bg-surface/30 p-4">
                    {activeTab === 'config' ? (
                        <>
                            <h3 className="mb-4 text-sm font-semibold text-text-secondary">Configuration</h3>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-xs font-medium text-text-tertiary">Type</label>
                                        <p className="mt-1 text-sm text-white">{getConnectorType()}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-text-tertiary">Created At</label>
                                        <p className="mt-1 text-sm text-white">{fullConnector.createdAt}</p>
                                    </div>
                                    {fullConnector.config && Object.entries(fullConnector.config).map(([key, value]) => {
                                        // Skip rendering if value is null, undefined, or an object/array
                                        if (value === null || value === undefined) return null;
                                        if (typeof value === 'object') return null;

                                        const displayValue = key.toLowerCase().includes('password')
                                            ? '••••••••'
                                            : String(value);

                                        return (
                                            <div key={key}>
                                                <label className="text-xs font-medium text-text-tertiary">{key}</label>
                                                <p className="mt-1 text-sm text-white">{displayValue}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <h3 className="mb-4 text-sm font-semibold text-text-secondary">Registered Tables</h3>
                            {loadingTables ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                </div>
                            ) : tables.length === 0 ? (
                                <p className="text-sm text-text-tertiary">No tables registered.</p>
                            ) : (
                                <div className="space-y-2">
                                    {tables.map((table) => (
                                        <div key={table.name} className="rounded-lg border border-surface-border bg-surface-elevated overflow-hidden">
                                            <button
                                                onClick={() => toggleTableExpand(table.name)}
                                                className="flex w-full items-center justify-between p-3 text-left hover:bg-surface-border/50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-text-tertiary">table_chart</span>
                                                    <div>
                                                        <p className="font-medium text-white">{table.name}</p>
                                                        {table.displayName && (
                                                            <p className="text-xs text-text-tertiary">{table.displayName}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`material-symbols-outlined text-text-tertiary transition-transform ${expandedTables.has(table.name) ? 'rotate-180' : ''}`}>
                                                    expand_more
                                                </span>
                                            </button>

                                            {expandedTables.has(table.name) && (
                                                <div className="border-t border-surface-border bg-surface p-3">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="text-left text-xs text-text-tertiary">
                                                                <th className="pb-2">Column</th>
                                                                <th className="pb-2">Type</th>
                                                                <th className="pb-2">Semantic Type</th>
                                                                <th className="pb-2">Key</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {table.columns.map((col) => (
                                                                <tr key={col.name} className="border-b border-surface-border/30 last:border-0">
                                                                    <td className="py-2 text-white">{col.name}</td>
                                                                    <td className="py-2 text-text-secondary">{col.dataType}</td>
                                                                    <td className="py-2 text-text-secondary">{col.semanticType || '-'}</td>
                                                                    <td className="py-2 text-text-secondary">
                                                                        {col.isPrimaryKey && <span className="rounded bg-primary/20 px-1.5 py-0.5 text-xs text-primary">PK</span>}
                                                                        {col.isForeignKey && <span className="ml-1 rounded bg-blue-500/20 px-1.5 py-0.5 text-xs text-blue-400">FK</span>}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Action Bar */}
                <div className="mb-6 flex flex-wrap gap-3">
                    <button
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        className="flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated disabled:opacity-50"
                    >
                        {isTesting ? (
                            <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                        ) : (
                            <span className="material-symbols-outlined text-lg">wifi</span>
                        )}
                        Test Connection
                    </button>
                    {connector.status === 'APPROVED' && onCreateEndpoint && (
                        <button
                            onClick={() => onCreateEndpoint(connector.id)}
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90"
                        >
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            Create Data Endpoint
                        </button>
                    )}
                    <button
                        onClick={() => onEdit(connector.id)}
                        className="flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated"
                    >
                        <span className="material-symbols-outlined text-lg">edit</span>
                        Edit
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10"
                    >
                        <span className="material-symbols-outlined text-lg">delete</span>
                        Delete
                    </button>
                    {connector.status === 'INIT' && (
                        <>
                            <button
                                onClick={() => onApprove(connector.id)}
                                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                            >
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                Approve
                            </button>
                            <button
                                onClick={() => onReject(connector.id)}
                                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                <span className="material-symbols-outlined text-lg">cancel</span>
                                Reject
                            </button>
                        </>
                    )}
                </div>

                {/* Audit Log */}
                <div className="rounded-lg border border-surface-border/50 bg-surface/30 p-4">
                    <h3 className="mb-4 text-sm font-semibold text-text-secondary">Audit Log</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-surface-border">
                                    <th className="pb-3 text-left text-xs font-medium text-text-tertiary">Action</th>
                                    <th className="pb-3 text-left text-xs font-medium text-text-tertiary">User</th>
                                    <th className="pb-3 text-left text-xs font-medium text-text-tertiary">Time</th>
                                    <th className="pb-3 text-left text-xs font-medium text-text-tertiary">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-4 text-center text-sm text-text-tertiary">
                                            No audit logs available
                                        </td>
                                    </tr>
                                ) : (
                                    auditLogs.map((log) => (
                                        <tr key={log.id} className="border-b border-surface-border/50">
                                            <td className="py-3 text-sm text-white">{log.action}</td>
                                            <td className="py-3 text-sm text-text-secondary">{log.user}</td>
                                            <td className="py-3 text-sm text-text-secondary">{log.timestamp}</td>
                                            <td className="py-3 text-sm text-text-tertiary">{log.details}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-xl border border-surface-border-subtle bg-surface p-6 shadow-xl">
                            <h3 className="mb-4 text-xl font-bold text-white">Confirm Delete</h3>
                            <p className="mb-6 text-sm text-text-secondary">
                                Are you sure you want to delete "{connector.name}"? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-text-tertiary hover:bg-surface-elevated hover:text-text-primary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
