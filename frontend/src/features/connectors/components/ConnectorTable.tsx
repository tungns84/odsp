import React from 'react';
import type { Connector } from '../../../types/connector';

interface ConnectorTableProps {
    connectors: Connector[];
    onView: (id: string) => void;
    onDelete: (id: string) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export const ConnectorTable: React.FC<ConnectorTableProps> = ({
    connectors,
    onView,
    onDelete,
    onApprove,
    onReject
}) => {
    const getStatusBadge = (status: Connector['status']) => {
        const statusConfig = {
            APPROVED: {
                bg: 'bg-green-500/20',
                text: 'text-green-400',
                label: 'Active'
            },
            INIT: {
                bg: 'bg-orange-500/20',
                text: 'text-orange-400',
                label: 'Pending Approval'
            },
            REJECTED: {
                bg: 'bg-red-500/20',
                text: 'text-red-400',
                label: 'Rejected'
            }
        };

        const config = statusConfig[status];
        return (
            <span className={`inline-flex items-center rounded-full ${config.bg} px-2.5 py-0.5 text-xs font-medium ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const getTypeLabel = (type: Connector['type'] | { type?: string }) => {
        const typeLabels: Record<string, string> = {
            DATABASE: 'Database',
            API: 'API',
            FILE_SYSTEM: 'File System'
        };

        // Handle both string and object format
        const typeStr = typeof type === 'string' ? type : (type as any)?.type || 'Unknown';
        return typeLabels[typeStr] || typeStr;
    };

    return (
        <div className="overflow-hidden rounded-lg border border-surface-border-subtle">
            <table className="min-w-full divide-y divide-slate-200/10">
                <thead className="bg-slate-500/10">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary" scope="col">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary" scope="col">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary" scope="col">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary" scope="col">Created At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary" scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/10 bg-slate-500/5">
                    {connectors.map((connector) => (
                        <tr key={connector.id}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">{connector.name}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">{getTypeLabel(connector.type)}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                                {getStatusBadge(connector.status)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">{connector.createdAt}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                <div className="flex items-center gap-4">
                                    {connector.status === 'INIT' ? (
                                        <>
                                            <button
                                                className="text-text-tertiary hover:text-green-500"
                                                onClick={() => onApprove(connector.id)}
                                                title="Approve"
                                            >
                                                <span className="material-symbols-outlined text-xl">check_circle</span>
                                            </button>
                                            <button
                                                className="text-text-tertiary hover:text-red-500"
                                                onClick={() => onReject(connector.id)}
                                                title="Reject"
                                            >
                                                <span className="material-symbols-outlined text-xl">cancel</span>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="text-text-tertiary hover:text-primary"
                                                onClick={() => onView(connector.id)}
                                                title="View"
                                            >
                                                <span className="material-symbols-outlined text-xl">visibility</span>
                                            </button>
                                            <button
                                                className="text-text-tertiary hover:text-red-500"
                                                onClick={() => onDelete(connector.id)}
                                                title="Delete"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
