import { useState, lazy, Suspense } from 'react';
import { Play, Code, LayoutGrid, Save } from 'lucide-react';
import type { FilterCondition, SortConfig } from '../../types/commonTypes';
import type { TableMetadata } from '../../types/connectorTypes';

// Lazy load Monaco Editor to reduce initial bundle size (~300KB)
const MonacoEditor = lazy(() => import('@monaco-editor/react'));

interface QueryBuilderProps {
    table: TableMetadata | null;
    onExecute: (queryConfig: any) => void;
    onSave?: () => void;
    loading?: boolean;
}

type QueryMode = 'visual' | 'sql';

const operators = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN'] as const;

export function QueryBuilder({ table, onExecute, onSave, loading = false }: QueryBuilderProps) {
    const [mode, setMode] = useState<QueryMode>('visual');
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [filters, setFilters] = useState<FilterCondition[]>([]);
    const [sortOrder, setSortOrder] = useState<SortConfig | null>(null);
    const [limit, setLimit] = useState<number>(100);
    const [customSQL, setCustomSQL] = useState<string>('');

    const columns = table?.columns.map(c => c.name) || [];

    // Toggle column selection
    const handleColumnToggle = (column: string) => {
        if (selectedColumns.includes(column)) {
            setSelectedColumns(selectedColumns.filter(c => c !== column));
        } else {
            setSelectedColumns([...selectedColumns, column]);
        }
    };

    // Filter management
    const handleAddFilter = () => {
        setFilters([...filters, { field: '', operator: '=', value: '' }]);
    };

    const handleRemoveFilter = (index: number) => {
        setFilters(filters.filter((_, i) => i !== index));
    };

    const handleFilterChange = (index: number, field: keyof FilterCondition, value: string) => {
        const newFilters = [...filters];
        newFilters[index] = { ...newFilters[index], [field]: value };
        setFilters(newFilters);
    };

    // Generate SQL preview from visual selections
    const generateSQL = (): string => {
        if (!table) return '';

        const cols = selectedColumns.length > 0 ? selectedColumns.join(', ') : '*';
        let sql = `SELECT ${cols}\nFROM ${table.name}`;

        if (filters.length > 0) {
            const conditions = filters
                .filter(f => f.field && f.value)
                .map(f => `${f.field} ${f.operator} '${f.value}'`)
                .join(' AND ');
            if (conditions) {
                sql += `\nWHERE ${conditions}`;
            }
        }

        if (sortOrder && sortOrder.field) {
            sql += `\nORDER BY ${sortOrder.field} ${sortOrder.direction}`;
        }

        if (limit > 0) {
            sql += `\nLIMIT ${limit}`;
        }

        return sql;
    };

    // Execute query
    const handleExecute = () => {
        if (!table) return;

        if (mode === 'visual') {
            // Build QueryConfig for BUILDER mode
            onExecute({
                mode: 'BUILDER',
                rootTable: table.name,
                columns: selectedColumns.length > 0
                    ? selectedColumns.map(col => ({ table: table.name, name: col }))
                    : undefined,
                filters: filters.filter(f => f.field && f.value),
                sort: sortOrder ? [sortOrder] : undefined,
                limit
            });
        } else {
            // Build QueryConfig for SQL mode
            onExecute({
                mode: 'SQL',
                sql: customSQL
            });
        }
    };

    if (!table) {
        return (
            <div className="rounded-xl border border-dashed border-surface-border p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
                    <Code size={32} />
                </div>
                <h3 className="text-lg font-medium text-text-primary">No Table Selected</h3>
                <p className="mt-2 text-sm text-text-tertiary">Select a table from the browser to start building queries</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-text-primary">{table.displayName || table.name}</h3>
                    <p className="text-xs text-text-tertiary">{columns.length} columns available</p>
                </div>

                {/* Mode Toggle */}
                <div className="flex rounded-lg border border-surface-border overflow-hidden">
                    <button
                        onClick={() => setMode('visual')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${mode === 'visual'
                            ? 'bg-primary text-white'
                            : 'bg-surface text-text-secondary hover:bg-surface-elevated'
                            }`}
                    >
                        <LayoutGrid size={16} />
                        Visual
                    </button>
                    <button
                        onClick={() => setMode('sql')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${mode === 'sql'
                            ? 'bg-primary text-white'
                            : 'bg-surface text-text-secondary hover:bg-surface-elevated'
                            }`}
                    >
                        <Code size={16} />
                        SQL
                    </button>
                </div>
            </div>

            {/* Visual Builder */}
            {mode === 'visual' && (
                <div className="space-y-4">
                    {/* Column Selection */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Select Columns</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 rounded-lg border border-surface-border bg-surface/30">
                            {columns.map((column) => (
                                <label
                                    key={column}
                                    className="flex items-center gap-2 cursor-pointer hover:text-text-primary text-text-secondary"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedColumns.includes(column)}
                                        onChange={() => handleColumnToggle(column)}
                                        className="h-4 w-4 rounded text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm">{column}</span>
                                </label>
                            ))}
                        </div>
                        {selectedColumns.length === 0 && (
                            <p className="text-xs text-text-tertiary mt-1">No columns selected (will return all columns)</p>
                        )}
                    </div>

                    {/* Filters */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-text-secondary">Filters</label>
                            <button
                                onClick={handleAddFilter}
                                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Add Filter
                            </button>
                        </div>
                        {filters.length === 0 ? (
                            <p className="text-xs text-text-tertiary">No filters added</p>
                        ) : (
                            <div className="space-y-2">
                                {filters.map((filter, index) => (
                                    <div key={index} className="flex gap-2">
                                        <select
                                            value={filter.field}
                                            onChange={(e) => handleFilterChange(index, 'field', e.target.value)}
                                            className="flex-1 rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                                        >
                                            <option value="">Select field...</option>
                                            {columns.map((col) => (
                                                <option key={col} value={col}>{col}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={filter.operator}
                                            onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
                                            className="w-24 rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                                        >
                                            {operators.map((op) => (
                                                <option key={op} value={op}>{op}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            value={filter.value}
                                            onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                                            placeholder="Value"
                                            className="flex-1 rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                                        />
                                        <button
                                            onClick={() => handleRemoveFilter(index)}
                                            className="rounded-lg border border-error-border px-3 py-2 text-error hover:bg-error-bg"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sort & Limit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Sort By</label>
                            <div className="flex gap-2">
                                <select
                                    value={sortOrder?.field || ''}
                                    onChange={(e) => setSortOrder(e.target.value ? { field: e.target.value, direction: sortOrder?.direction || 'ASC' } : null)}
                                    className="flex-1 rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                                >
                                    <option value="">No sorting</option>
                                    {columns.map((col) => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                                {sortOrder && (
                                    <select
                                        value={sortOrder.direction}
                                        onChange={(e) => setSortOrder({ ...sortOrder, direction: e.target.value as 'ASC' | 'DESC' })}
                                        className="w-28 rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                                    >
                                        <option value="ASC">ASC</option>
                                        <option value="DESC">DESC</option>
                                    </select>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Limit</label>
                            <input
                                type="number"
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                min={1}
                                max={10000}
                                className="w-full rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* SQL Preview */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">SQL Preview</label>
                        <pre className="rounded-lg border border-surface-border bg-surface/50 p-4 text-xs text-green-400 overflow-x-auto font-mono">
                            {generateSQL()}
                        </pre>
                    </div>
                </div>
            )}

            {/* SQL Editor */}
            {mode === 'sql' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">SQL Query</label>
                        <div className="rounded-lg border border-surface-border overflow-hidden">
                            <Suspense fallback={
                                <div className="h-[300px] bg-surface-elevated animate-pulse flex items-center justify-center">
                                    <span className="text-text-tertiary text-sm">Loading SQL Editor...</span>
                                </div>
                            }>
                                <MonacoEditor
                                    height="300px"
                                    defaultLanguage="sql"
                                    value={customSQL}
                                    onChange={(value: string | undefined) => setCustomSQL(value || '')}
                                    theme="vs-dark"
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        lineNumbers: 'on',
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true
                                    }}
                                />
                            </Suspense>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-surface-border">
                <button
                    onClick={handleExecute}
                    disabled={loading || (mode === 'sql' && !customSQL)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <>
                            <span className="material-symbols-outlined animate-spin">sync</span>
                            Executing...
                        </>
                    ) : (
                        <>
                            <Play size={16} />
                            Execute Query
                        </>
                    )}
                </button>
                {onSave && (
                    <button
                        onClick={onSave}
                        className="flex items-center gap-2 px-4 py-2 border border-surface-border text-text-secondary rounded-lg hover:bg-surface-elevated transition-colors"
                    >
                        <Save size={16} />
                        Save as Endpoint
                    </button>
                )}
            </div>
        </div>
    );
}
