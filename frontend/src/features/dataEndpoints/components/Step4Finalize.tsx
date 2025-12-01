import React, { useState } from 'react';
import type { WizardState } from '../../../types/dataEndpoint';
import type { Connector } from '../../../types/connector';
import { dataEndpointService } from '../../../services';

interface Step4FinalizeProps {
    wizardState: WizardState;
    connectors: Connector[];
    endpointName: string;
    description: string;
    onEndpointNameChange: (name: string) => void;
    onDescriptionChange: (desc: string) => void;
}

export const Step4Finalize: React.FC<Step4FinalizeProps> = ({
    wizardState,
    connectors,
    endpointName,
    description,
    onEndpointNameChange,
    onDescriptionChange,
}) => {
    const [testResult, setTestResult] = useState<{ success: boolean; message: string; data?: { columns: string[]; rows: Record<string, any>[] } } | null>(null);
    const [isTesting, setIsTesting] = useState(false);

    const selectedConnector = connectors.find(c => c.id === wizardState.selectedConnectorId);

    const handleTestQuery = async () => {
        if (!wizardState.selectedConnectorId) {
            setTestResult({
                success: false,
                message: 'No connector selected'
            });
            return;
        }

        setIsTesting(true);
        setTestResult(null);

        try {
            const startTime = Date.now();

            // Build QueryConfig based on wizard state
            let queryConfig: any;

            if (wizardState.sourceType === 'table') {
                // Build query config for table mode
                queryConfig = {
                    mode: 'BUILDER',
                    rootTable: wizardState.tableName,
                    columns: wizardState.selectedColumns.length > 0
                        ? wizardState.selectedColumns.map(col => ({
                            table: wizardState.tableName,
                            name: col
                        }))
                        : [],
                    filters: wizardState.filters
                        .filter(f => f.field && f.value)
                        .map(f => ({
                            field: f.field,
                            operator: f.operator,
                            value: f.value
                        })),
                    sort: wizardState.sortOrder ? [{
                        field: wizardState.sortOrder.field,
                        direction: wizardState.sortOrder.direction
                    }] : [],
                    limit: 5
                };
            } else {
                // Custom SQL mode
                queryConfig = {
                    mode: 'SQL',
                    sql: wizardState.customSQL,
                    limit: 10
                };
            }

            const response = await dataEndpointService.testQuery({
                connectorId: wizardState.selectedConnectorId,
                queryConfig
            });
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            setTestResult({
                success: true,
                message: `Endpoint test successful! ${response.data.rowCount} rows returned in ${duration}s.`,
                data: {
                    columns: response.data.columns,
                    rows: response.data.rows
                }
            });
        } catch (err: any) {
            console.error('Test endpoint failed:', err);
            setTestResult({
                success: false,
                message: err.response?.data?.error || err.response?.data?.message || 'Test failed: Unable to execute query.'
            });
        } finally {
            setIsTesting(false);
        }
    };


    return (
        <div className="space-y-6">
            <p className="text-sm text-text-tertiary">
                Review your configuration and provide a name for your endpoint.
            </p>

            {/* Endpoint Details */}
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-text-tertiary">Endpoint Name *</label>
                    <input
                        type="text"
                        value={endpointName}
                        onChange={(e) => onEndpointNameChange(e.target.value)}
                        placeholder="e.g., users-active"
                        className="mt-2 w-full rounded-lg border border-surface-border bg-surface-elevated/50 px-3 py-2 text-white focus:border-primary focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-text-tertiary">This will be used as the API endpoint path</p>
                </div>

                <div>
                    <label className="text-sm font-medium text-text-tertiary">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        placeholder="Optional description of this endpoint..."
                        rows={3}
                        className="mt-2 w-full rounded-lg border border-surface-border bg-surface-elevated/50 px-3 py-2 text-white focus:border-primary focus:outline-none"
                    />
                </div>
            </div>

            {/* Configuration Summary */}
            <div className="rounded-lg border border-surface-border/50 bg-surface/30 p-4">
                <h3 className="mb-4 text-sm font-semibold text-text-secondary">Configuration Summary</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-text-tertiary">Connector:</span>
                        <span className="font-medium text-white">{selectedConnector?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-tertiary">Source Type:</span>
                        <span className="font-medium text-white">
                            {wizardState.sourceType === 'table' ? 'Table Selection' : 'Custom SQL'}
                        </span>
                    </div>
                    {wizardState.sourceType === 'table' && (
                        <>
                            <div className="flex justify-between">
                                <span className="text-text-tertiary">Table:</span>
                                <span className="font-medium text-white">{wizardState.tableName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-tertiary">Columns:</span>
                                <span className="font-medium text-white">
                                    {wizardState.selectedColumns.length > 0
                                        ? wizardState.selectedColumns.join(', ')
                                        : 'All columns'}
                                </span>
                            </div>
                            {wizardState.filters.length > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-text-tertiary">Filters:</span>
                                    <span className="font-medium text-white">{wizardState.filters.length} condition(s)</span>
                                </div>
                            )}
                            {wizardState.sortOrder && (
                                <div className="flex justify-between">
                                    <span className="text-text-tertiary">Sort:</span>
                                    <span className="font-medium text-white">
                                        {wizardState.sortOrder.field} {wizardState.sortOrder.direction}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Test Query */}
            <div>
                <button
                    onClick={handleTestQuery}
                    disabled={isTesting}
                    className="flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated disabled:opacity-50"
                >
                    {isTesting ? (
                        <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                    ) : (
                        <span className="material-symbols-outlined text-lg">play_arrow</span>
                    )}
                    Test Endpoint
                </button>

                {/* Test Result Message */}
                {testResult && !testResult.data && (
                    <div className={`mt-3 rounded-lg p-3 text-sm ${testResult.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">
                                {testResult.success ? 'check_circle' : 'error'}
                            </span>
                            {testResult.message}
                        </div>
                    </div>
                )}

                {/* Test Result Table */}
                {testResult?.data && (
                    <div className="mt-3 space-y-3">
                        <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                {testResult.message}
                            </div>
                        </div>
                        <div className="rounded-lg border border-surface-border overflow-hidden">
                            <div className="overflow-x-auto max-h-96">
                                <table className="w-full text-sm">
                                    <thead className="bg-surface-elevated/50 sticky top-0">
                                        <tr>
                                            {testResult.data.columns.map((col) => (
                                                <th key={col} className="px-4 py-3 text-left text-xs font-medium text-text-secondary border-b border-surface-border">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {testResult.data.rows.map((row, idx) => (
                                            <tr key={idx} className="border-b border-surface-border/50 hover:bg-surface-elevated/30">
                                                {testResult.data!.columns.map((col) => (
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
                    </div>
                )}
            </div>
        </div>
    );
};
