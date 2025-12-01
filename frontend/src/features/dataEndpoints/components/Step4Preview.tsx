import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { TableMetadata } from '../../../types/connector';
import { dataEndpointService } from '../../../services';

import type { QueryConfig } from '../../../types/dataEndpoint';

interface Step4PreviewProps {
    connectorId: string | null;
    queryConfig: QueryConfig;
    tables: TableMetadata[];
}

export const Step4Preview: React.FC<Step4PreviewProps> = ({
    connectorId,
    queryConfig,
    tables
}) => {
    const [previewData, setPreviewData] = useState<{ columns: string[]; rows: Record<string, any>[]; generatedSql?: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPreview = async () => {
            if (!connectorId) return;

            setLoading(true);
            setError(null);
            try {
                const response = await dataEndpointService.testQuery({
                    connectorId,
                    queryConfig
                });

                setPreviewData({
                    columns: response.data.columns,
                    rows: response.data.rows,
                    generatedSql: response.data.generatedSql
                });
            } catch (err: any) {
                console.error('Preview failed:', err);
                setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load preview data.');
            } finally {
                setLoading(false);
            }
        };

        fetchPreview();
    }, [connectorId, queryConfig]);

    // Get semantic type for a column name (only if we can map it back to the original table)
    const getSemanticType = (columnName: string): string | undefined => {
        if (queryConfig.mode === 'BUILDER' && queryConfig.rootTable) {
            const table = tables.find(t => t.name === queryConfig.rootTable);
            if (table) {
                const column = table.columns?.find(c => c.name === columnName);
                return column?.semanticType;
            }
        }
        return undefined;
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-text-tertiary">
                Review your configuration and preview the data before creating the endpoint.
            </p>

            {/* SQL Preview */}
            <div>
                <h3 className="mb-3 text-sm font-semibold text-text-secondary">Final Query</h3>
                <div className="rounded-lg border border-surface-border overflow-hidden">
                    <Editor
                        height="200px"
                        defaultLanguage="sql"
                        value={previewData?.generatedSql || '-- SQL will appear here after loading --'}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            lineNumbers: 'on',
                            readOnly: true,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                    />
                </div>
            </div>

            {/* Data Preview */}
            <div>
                <h3 className="mb-3 text-sm font-semibold text-text-secondary">Data Preview</h3>

                {loading && (
                    <div className="flex items-center justify-center py-8 text-text-tertiary">
                        <span className="material-symbols-outlined animate-spin mr-2">sync</span>
                        Loading preview...
                    </div>
                )}

                {error && (
                    <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    </div>
                )}

                {!loading && !error && previewData && (
                    <div className="rounded-lg border border-surface-border overflow-hidden">
                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-sm">
                                <thead className="bg-surface-elevated/50 sticky top-0">
                                    <tr>
                                        {previewData.columns.map((col) => {
                                            const semanticType = getSemanticType(col);
                                            return (
                                                <th key={col} className="px-4 py-3 text-left text-xs font-medium text-text-secondary border-b border-surface-border">
                                                    <div className="flex items-center gap-2">
                                                        <span>{col}</span>
                                                        {semanticType && (
                                                            <span className="px-1.5 py-0.5 text-[10px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded">
                                                                {semanticType}
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={previewData.columns.length} className="px-4 py-8 text-center text-text-tertiary">
                                                No data returned
                                            </td>
                                        </tr>
                                    ) : (
                                        previewData.rows.map((row, idx) => (
                                            <tr key={idx} className="border-b border-surface-border/50 hover:bg-surface-elevated/30">
                                                {previewData.columns.map((col) => (
                                                    <td key={col} className="px-4 py-3 text-text-secondary whitespace-nowrap">
                                                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-slate-600 italic">null</span>}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-surface-elevated/30 px-4 py-2 text-xs text-text-tertiary border-t border-surface-border">
                            Showing up to 10 rows for preview
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
