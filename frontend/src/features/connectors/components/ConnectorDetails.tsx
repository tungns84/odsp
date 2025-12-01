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

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        await onTestConnection(connector.id);

        // Simulate result
        await new Promise(resolve => setTimeout(resolve, 1500));
        const success = Math.random() > 0.3;
        setTestResult({
            success,
            message: success ? 'Connection successful!' : 'Failed to connect: Connection timed out.'
        });
        setIsTesting(false);
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
                <div className="mb-6 rounded-lg border border-surface-border/50 bg-surface/30 p-4">
                    <h3 className="mb-4 text-sm font-semibold text-text-secondary">Configuration</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-xs font-medium text-text-tertiary">Type</label>
                            <p className="mt-1 text-sm text-white">{connector.type}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-tertiary">Created At</label>
                            <p className="mt-1 text-sm text-white">{connector.createdAt}</p>
                        </div>
                        {connector.config && Object.entries(connector.config).map(([key, value]) => (
                            <div key={key}>
                                <label className="text-xs font-medium text-text-tertiary">{key}</label>
                                <p className="mt-1 text-sm text-white">
                                    {key.toLowerCase().includes('password') ? '••••••••' : String(value)}
                                </p>
                            </div>
                        ))}
                    </div>
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
