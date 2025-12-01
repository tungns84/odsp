import React from 'react';
import type { FilterCondition, SortConfig, ColumnMaskingConfig, MaskingType } from '../../../types/dataEndpoint';

interface Step3BuildQueryProps {
    tableName: string;
    columns: string[];
    selectedColumns: string[];
    filters: FilterCondition[];
    sortOrder: SortConfig | null;
    maskingConfig: ColumnMaskingConfig;
    onColumnsChange: (columns: string[]) => void;
    onFiltersChange: (filters: FilterCondition[]) => void;
    onSortOrderChange: (sort: SortConfig | null) => void;
    onMaskingConfigChange: (config: ColumnMaskingConfig) => void;
}

const operators = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN'] as const;

export const Step3BuildQuery: React.FC<Step3BuildQueryProps> = ({
    tableName,
    columns,
    selectedColumns,
    filters,
    sortOrder,
    maskingConfig,
    onColumnsChange,
    onFiltersChange,
    onSortOrderChange,
    onMaskingConfigChange,
}) => {
    const handleColumnToggle = (column: string) => {
        if (selectedColumns.includes(column)) {
            onColumnsChange(selectedColumns.filter(c => c !== column));
        } else {
            onColumnsChange([...selectedColumns, column]);
        }
    };

    const handleAddFilter = () => {
        onFiltersChange([...filters, { field: '', operator: '=', value: '' }]);
    };

    const handleRemoveFilter = (index: number) => {
        onFiltersChange(filters.filter((_, i) => i !== index));
    };

    const handleFilterChange = (index: number, field: keyof FilterCondition, value: string) => {
        const newFilters = [...filters];
        newFilters[index] = { ...newFilters[index], [field]: value };
        onFiltersChange(newFilters);
    };

    const handleAddMasking = () => {
        // Add a new masking rule with first available column
        const availableColumn = selectedColumns.find(col => !maskingConfig[col]);
        if (availableColumn) {
            const newConfig = { ...maskingConfig };
            newConfig[availableColumn] = { type: 'MASK_ALL' };
            onMaskingConfigChange(newConfig);
        }
    };

    const handleRemoveMasking = (column: string) => {
        const newConfig = { ...maskingConfig };
        delete newConfig[column];
        onMaskingConfigChange(newConfig);
    };

    const handleMaskingFieldChange = (oldColumn: string, newColumn: string) => {
        const newConfig = { ...maskingConfig };
        const rule = newConfig[oldColumn];
        delete newConfig[oldColumn];
        if (newColumn && !newConfig[newColumn]) {
            newConfig[newColumn] = rule;
        }
        onMaskingConfigChange(newConfig);
    };

    const handleMaskingTypeChange = (column: string, type: MaskingType) => {
        const newConfig = { ...maskingConfig };
        if (type === 'NONE') {
            delete newConfig[column];
        } else {
            newConfig[column] = { type, pattern: type === 'PARTIAL' ? '***' : undefined };
        }
        onMaskingConfigChange(newConfig);
    };

    const handleMaskingPatternChange = (column: string, pattern: string) => {
        const newConfig = { ...maskingConfig };
        if (newConfig[column]) {
            newConfig[column] = { ...newConfig[column], pattern };
        }
        onMaskingConfigChange(newConfig);
    };

    // Generate SQL preview
    const generateSQL = () => {
        const cols = selectedColumns.length > 0 ? selectedColumns.join(', ') : '*';
        let sql = `SELECT ${cols}\nFROM ${tableName}`;

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

        return sql;
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-text-tertiary">
                Build your query by selecting columns, adding filters, and defining sort order.
            </p>

            {/* Column Selection */}
            <div>
                <h3 className="mb-3 text-sm font-semibold text-text-secondary">Select Columns</h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {columns.map((column) => (
                        <label
                            key={column}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-surface-border bg-surface/30 p-3 hover:border-surface-border"
                        >
                            <input
                                type="checkbox"
                                checked={selectedColumns.includes(column)}
                                onChange={() => handleColumnToggle(column)}
                                className="h-4 w-4 rounded text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-white">{column}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-text-secondary">Filters</h3>
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
                                    className="flex-1 rounded-lg border border-surface-border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                                >
                                    <option value="">Select field...</option>
                                    {columns.map((col) => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                                <select
                                    value={filter.operator}
                                    onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
                                    className="w-24 rounded-lg border border-surface-border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
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
                                    className="flex-1 rounded-lg border border-surface-border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                                />
                                <button
                                    onClick={() => handleRemoveFilter(index)}
                                    className="rounded-lg border border-red-500/50 px-3 py-2 text-red-400 hover:bg-red-500/10"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sort Order */}
            <div>
                <h3 className="mb-3 text-sm font-semibold text-text-secondary">Sort Order</h3>
                <div className="flex gap-2">
                    <select
                        value={sortOrder?.field || ''}
                        onChange={(e) => onSortOrderChange(e.target.value ? { field: e.target.value, direction: sortOrder?.direction || 'ASC' } : null)}
                        className="flex-1 rounded-lg border border-surface-border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    >
                        <option value="">No sorting</option>
                        {columns.map((col) => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                    </select>
                    {sortOrder && (
                        <select
                            value={sortOrder.direction}
                            onChange={(e) => onSortOrderChange({ ...sortOrder, direction: e.target.value as 'ASC' | 'DESC' })}
                            className="w-32 rounded-lg border border-surface-border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                        >
                            <option value="ASC">Ascending</option>
                            <option value="DESC">Descending</option>
                        </select>
                    )}
                </div>
            </div>

            {/* Masking Configuration */}
            {selectedColumns.length > 0 && (
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-text-secondary">Data Masking</h3>
                        <button
                            onClick={handleAddMasking}
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                            disabled={Object.keys(maskingConfig).length >= selectedColumns.length}
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Add Masking
                        </button>
                    </div>
                    {Object.keys(maskingConfig).length === 0 ? (
                        <p className="text-xs text-text-tertiary">No masking rules added</p>
                    ) : (
                        <div className="space-y-2">
                            {Object.entries(maskingConfig).map(([column, rule]) => (
                                <div key={column} className="flex gap-2">
                                    <select
                                        value={column}
                                        onChange={(e) => handleMaskingFieldChange(column, e.target.value)}
                                        className="flex-1 rounded-lg border border-surface-border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                                    >
                                        {selectedColumns.map((col) => (
                                            <option
                                                key={col}
                                                value={col}
                                                disabled={maskingConfig[col] && col !== column}
                                            >
                                                {col}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={rule.type}
                                        onChange={(e) => handleMaskingTypeChange(column, e.target.value as MaskingType)}
                                        className="w-40 rounded-lg border border-surface-border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                                    >
                                        <option value="MASK_ALL">Mask All (****)</option>
                                        <option value="PARTIAL">Partial Masking</option>
                                    </select>
                                    {rule.type === 'PARTIAL' && (
                                        <input
                                            type="text"
                                            value={rule.pattern || ''}
                                            onChange={(e) => handleMaskingPatternChange(column, e.target.value)}
                                            placeholder="e.g., ***@***.com"
                                            className="flex-1 rounded-lg border border-surface-border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                                        />
                                    )}
                                    <button
                                        onClick={() => handleRemoveMasking(column)}
                                        className="rounded-lg border border-red-500/50 px-3 py-2 text-red-400 hover:bg-red-500/10"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* SQL Preview */}
            <div>
                <h3 className="mb-3 text-sm font-semibold text-text-secondary">SQL Preview</h3>
                <pre className="rounded-lg border border-surface-border bg-surface/50 p-4 text-xs text-green-400 overflow-x-auto">
                    {generateSQL()}
                </pre>
            </div>
        </div>
    );
};
