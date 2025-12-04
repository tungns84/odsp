import React from 'react';
import type { Connector } from '../../../types/connector';

interface Step1SelectConnectorProps {
    connectors: Connector[];
    selectedConnectorId: string | null;
    onSelect: (connectorId: string) => void;
}

export const Step1SelectConnector: React.FC<Step1SelectConnectorProps> = ({
    connectors,
    selectedConnectorId,
    onSelect,
}) => {
    // Filter only APPROVED connectors
    const approvedConnectors = connectors.filter(c => c.status === 'APPROVED');

    const getStatusBadge = () => {
        return (
            <span className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
                Active
            </span>
        );
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-text-tertiary">
                Select a database connector to use as the data source for your endpoint.
            </p>

            {approvedConnectors.length === 0 ? (
                <div className="rounded-lg border border-surface-border bg-surface/30 p-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-text-tertiary">database</span>
                    <p className="mt-4 text-sm text-text-tertiary">No approved connectors available.</p>
                    <p className="mt-2 text-xs text-text-tertiary">
                        Please create and approve a connector first.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {approvedConnectors.map((connector) => (
                        <label
                            key={connector.id}
                            className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${selectedConnectorId === connector.id
                                ? 'border-primary bg-primary/10'
                                : 'border-surface-border bg-surface/30 hover:border-surface-border'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <input
                                    type="radio"
                                    name="connector"
                                    value={connector.id}
                                    checked={selectedConnectorId === connector.id}
                                    onChange={() => onSelect(connector.id)}
                                    className="h-4 w-4 text-primary focus:ring-primary"
                                />
                                <div>
                                    <h3 className="font-medium text-white">{connector.name}</h3>
                                    <p className="text-xs text-text-tertiary">
                                        {typeof connector.type === 'string'
                                            ? connector.type
                                            : (connector.type as any)?.type || 'Unknown'}
                                    </p>
                                </div>
                            </div>
                            {getStatusBadge()}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};
