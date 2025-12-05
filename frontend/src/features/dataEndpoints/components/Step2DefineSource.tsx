import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import type { SourceType } from '../../../types/dataEndpoint';
import type { TableMetadata } from '../../../types/connector';
import { sqlKeywords } from '../../../data';
import { dataEndpointService } from '../../../services';

interface Step2DefineSourceProps {
    sourceType: SourceType;
    tableName: string;
    customSQL: string;
    tables: TableMetadata[];
    tablesLoading?: boolean;
    connectorId: string | null;
    onSourceTypeChange: (type: SourceType) => void;
    onTableNameChange: (name: string) => void;
    onCustomSQLChange: (sql: string) => void;
}

export const Step2DefineSource: React.FC<Step2DefineSourceProps> = ({
    sourceType,
    tableName,
    customSQL,
    tables,
    tablesLoading = false,
    connectorId,
    onSourceTypeChange,
    onTableNameChange,
    onCustomSQLChange,
}) => {
    const [testResult, setTestResult] = useState<{ success: boolean; message: string; data?: { columns: string[]; rows: Record<string, any>[] } } | null>(null);
    const [isTesting, setIsTesting] = useState(false);

    const handleTestQuery = async () => {
        if (!connectorId) {
            alert('Connector not selected');
            return;
        }

        setIsTesting(true);
        setTestResult(null);

        try {
            // Build queryConfig based on source type
            const queryConfig = sourceType === 'table'
                ? {
                    mode: 'BUILDER',
                    rootTable: tableName,
                    columns: [],
                    limit: 10
                }
                : {
                    mode: 'SQL',
                    sql: customSQL,
                    limit: 10
                };

            const response = await dataEndpointService.testQuery({
                connectorId,
                queryConfig
            });

            setTestResult({
                success: true,
                message: `Query executed successfully! ${response.data.rowCount} rows returned.`,
                data: {
                    columns: response.data.columns,
                    rows: response.data.rows
                }
            });
        } catch (err: any) {
            console.error('Test query failed:', err);
            setTestResult({
                success: false,
                message: err.response?.data?.error || err.response?.data?.message || 'Query failed. Please check your syntax.'
            });
        } finally {
            setIsTesting(false);
        }
    };

    // Get semantic type for a column name
    const getSemanticType = (columnName: string): string | undefined => {
        if (sourceType === 'table' && tableName) {
            const table = tables.find(t => t.name === tableName);
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
                Choose how you want to define the data source for your endpoint.
            </p>

            {/* Source Type Selection */}
            <div className="space-y-4">
                {/* Table Selection */}
                <label
                    className={`flex cursor-pointer flex-col rounded-lg border p-4 transition-colors ${sourceType === 'table'
                        ? 'border-primary bg-primary/10'
                        : 'border-surface-border bg-surface/30 hover:border-surface-border'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <input
                            type="radio"
                            name="sourceType"
                            value="table"
                            checked={sourceType === 'table'}
                            onChange={() => onSourceTypeChange('table')}
                            className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <div>
                            <h3 className="font-medium text-white">Table Selection</h3>
                            <p className="text-xs text-text-tertiary">Select a table and build a query visually</p>
                        </div>
                    </div>
                    {sourceType === 'table' && (
                        <div className="mt-4 ml-7">
                            <label className="text-xs font-medium text-text-tertiary">Table Name</label>
                            {tablesLoading ? (
                                <div className="mt-2 flex items-center gap-2 text-sm text-text-tertiary">
                                    <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                                    Loading tables...
                                </div>
                            ) : (
                                <select
                                    value={tableName}
                                    onChange={(e) => onTableNameChange(e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-surface-border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                                >
                                    <option value="">Select a table...</option>
                                    {tables.map((table) => (
                                        <option key={table.name} value={table.name}>
                                            {table.displayName || table.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                </label>

                {/* Custom SQL */}
                <div
                    className={`flex flex-col rounded-lg border p-4 transition-colors ${sourceType === 'customSQL'
                        ? 'border-primary bg-primary/10'
                        : 'border-surface-border bg-surface/30 hover:border-surface-border'
                        }`}
                >
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="radio"
                            name="sourceType"
                            value="customSQL"
                            checked={sourceType === 'customSQL'}
                            onChange={() => onSourceTypeChange('customSQL')}
                            className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <div>
                            <h3 className="font-medium text-white">Custom SQL</h3>
                            <p className="text-xs text-text-tertiary">Write your own SQL query</p>
                        </div>
                    </label>
                    {sourceType === 'customSQL' && (
                        <div className="mt-4 ml-7 space-y-3">
                            <label className="text-xs font-medium text-text-tertiary">SQL Query</label>
                            <div className="rounded-lg border border-surface-border overflow-hidden">
                                <Editor
                                    height="200px"
                                    defaultLanguage="sql"
                                    value={customSQL}
                                    onChange={(value) => onCustomSQLChange(value || '')}
                                    theme="vs-dark"
                                    onMount={(_editor, monaco) => {
                                        // Register SQL completion provider
                                        monaco.languages.registerCompletionItemProvider('sql', {
                                            provideCompletionItems: () => {
                                                const suggestions = [
                                                    // SQL Keywords
                                                    ...sqlKeywords.map(kw => ({
                                                        label: kw.label,
                                                        kind: monaco.languages.CompletionItemKind.Keyword,
                                                        insertText: kw.insertText,
                                                        documentation: kw.documentation
                                                    })),
                                                    // Table names
                                                    ...tables.map(table => ({
                                                        label: table.name,
                                                        kind: monaco.languages.CompletionItemKind.Class,
                                                        insertText: table.name,
                                                        documentation: `${table.name} table`
                                                    }))
                                                ];
                                                return { suggestions };
                                            }
                                        });
                                    }}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        lineNumbers: 'on',
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        readOnly: false,
                                        // Enable autocomplete and suggestions
                                        suggestOnTriggerCharacters: true,
                                        quickSuggestions: {
                                            other: true,
                                            comments: false,
                                            strings: false
                                        },
                                        wordBasedSuggestions: 'allDocuments',
                                        acceptSuggestionOnEnter: 'on',
                                        tabCompletion: 'on',
                                        suggest: {
                                            showKeywords: true,
                                            showSnippets: true,
                                        }
                                    }}
                                />
                            </div>
                            <button
                                onClick={handleTestQuery}
                                disabled={isTesting || !customSQL}
                                className="flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated disabled:opacity-50"
                            >
                                {isTesting ? (
                                    <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                                ) : (
                                    <span className="material-symbols-outlined text-lg">play_arrow</span>
                                )}
                                Test Query
                            </button>

                            {/* Test Result Message */}
                            {testResult && !testResult.data && (
                                <div className={`rounded-lg p-3 text-sm ${testResult.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
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
                                <div className="space-y-3">
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
                                                        {testResult.data.columns.map((col) => {
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
                    )}
                </div>
            </div>
        </div>
    );
};
