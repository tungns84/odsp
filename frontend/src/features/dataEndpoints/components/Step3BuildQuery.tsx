import React, { useState } from 'react';
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

// Preset patterns for partial masking
const PRESET_PATTERNS = [
    { id: 'showFirst4', label: 'Show First 4', pattern: 'ShowFirst4', preview: '1234******' },
    { id: 'showLast4', label: 'Show Last 4', pattern: 'ShowLast4', preview: '******6789' },
    { id: 'email', label: 'Email', pattern: '***@***.com', preview: 'j****e@email.com' },
    { id: 'custom', label: 'Custom', pattern: '', preview: '' },
];

// Sample data for preview
const SAMPLE_DATA: Record<string, string> = {
    email: 'john.doe@example.com',
    phone: '0123456789',
    ssn: '123-45-6789',
    default: 'SensitiveData123',
};

// Masking preview function (mirrors backend logic)
const applyMaskingPreview = (value: string, type: MaskingType, pattern?: string): string => {
    if (type === 'MASK_ALL') {
        return '*****';
    }
    if (type === 'PARTIAL' && pattern) {
        if (pattern.startsWith('ShowFirst')) {
            const count = parseInt(pattern.substring(9)) || 0;
            if (value.length <= count) return value;
            return value.substring(0, count) + '*'.repeat(value.length - count);
        }
        if (pattern.startsWith('ShowLast')) {
            const count = parseInt(pattern.substring(8)) || 0;
            if (value.length <= count) return value;
            return '*'.repeat(value.length - count) + value.substring(value.length - count);
        }
        if (pattern.includes('@')) {
            const atIndex = value.indexOf('@');
            if (atIndex > 0) {
                const local = value.substring(0, atIndex);
                const domain = value.substring(atIndex + 1);
                const maskedLocal = local.length > 2
                    ? local[0] + '****' + local[local.length - 1]
                    : '****';
                return maskedLocal + '@' + domain;
            }
        }
        return pattern || '*****';
    }
    return value;
};

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
    const [expandedMasking, setExpandedMasking] = useState<string | null>(null);

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
        const availableColumn = selectedColumns.find(col => !maskingConfig[col]);
        if (availableColumn) {
            const newConfig = { ...maskingConfig };
            newConfig[availableColumn] = { type: 'MASK_ALL' };
            onMaskingConfigChange(newConfig);
            setExpandedMasking(availableColumn);
        }
    };

    const handleRemoveMasking = (column: string) => {
        const newConfig = { ...maskingConfig };
        delete newConfig[column];
        onMaskingConfigChange(newConfig);
        if (expandedMasking === column) setExpandedMasking(null);
    };

    const handleMaskingFieldChange = (oldColumn: string, newColumn: string) => {
        const newConfig = { ...maskingConfig };
        const rule = newConfig[oldColumn];
        delete newConfig[oldColumn];
        if (newColumn && !newConfig[newColumn]) {
            newConfig[newColumn] = rule;
        }
        onMaskingConfigChange(newConfig);
        setExpandedMasking(newColumn);
    };

    const handleMaskingTypeChange = (column: string, type: MaskingType) => {
        const newConfig = { ...maskingConfig };
        if (type === 'NONE') {
            delete newConfig[column];
        } else {
            newConfig[column] = { type, pattern: type === 'PARTIAL' ? 'ShowFirst4' : undefined };
        }
        onMaskingConfigChange(newConfig);
    };

    const handlePresetSelect = (column: string, pattern: string) => {
        const newConfig = { ...maskingConfig };
        if (newConfig[column]) {
            newConfig[column] = { ...newConfig[column], pattern };
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

    const getSampleValue = (column: string): string => {
        const lowerCol = column.toLowerCase();
        if (lowerCol.includes('email')) return SAMPLE_DATA.email;
        if (lowerCol.includes('phone') || lowerCol.includes('tel')) return SAMPLE_DATA.phone;
        if (lowerCol.includes('ssn') || lowerCol.includes('social')) return SAMPLE_DATA.ssn;
        return SAMPLE_DATA.default;
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

            {/* Masking Configuration - Improved UI */}
            {selectedColumns.length > 0 && (
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-primary">security</span>
                            <h3 className="text-sm font-semibold text-text-secondary">Data Masking</h3>
                        </div>
                        <button
                            onClick={handleAddMasking}
                            className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20 disabled:opacity-50"
                            disabled={Object.keys(maskingConfig).length >= selectedColumns.length}
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Add Masking Rule
                        </button>
                    </div>

                    {Object.keys(maskingConfig).length === 0 ? (
                        <div className="rounded-lg border border-dashed border-surface-border bg-surface/20 p-4 text-center">
                            <span className="material-symbols-outlined mb-2 text-2xl text-text-tertiary">visibility_off</span>
                            <p className="text-xs text-text-tertiary">No masking rules added. Click "Add Masking Rule" to protect sensitive data.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(maskingConfig).map(([column, rule]) => {
                                const isExpanded = expandedMasking === column;
                                const sampleValue = getSampleValue(column);
                                const maskedValue = applyMaskingPreview(sampleValue, rule.type, rule.pattern);

                                return (
                                    <div
                                        key={column}
                                        className="rounded-xl border border-surface-border bg-surface/30 overflow-hidden"
                                    >
                                        {/* Header */}
                                        <div
                                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-surface/50"
                                            onClick={() => setExpandedMasking(isExpanded ? null : column)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-lg text-amber-400">
                                                    {rule.type === 'MASK_ALL' ? 'lock' : 'lock_open'}
                                                </span>
                                                <div>
                                                    <span className="text-sm font-medium text-white">{column}</span>
                                                    <span className="ml-2 text-xs text-text-tertiary">
                                                        {rule.type === 'MASK_ALL' ? 'Full Mask' : `Partial: ${rule.pattern}`}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-green-400 font-mono">{maskedValue}</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveMasking(column); }}
                                                    className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                                                >
                                                    <span className="material-symbols-outlined text-lg">close</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div className="border-t border-surface-border p-4 space-y-4 bg-surface/20">
                                                {/* Column Selector */}
                                                <div>
                                                    <label className="block text-xs text-text-tertiary mb-1">Column</label>
                                                    <select
                                                        value={column}
                                                        onChange={(e) => handleMaskingFieldChange(column, e.target.value)}
                                                        className="w-full rounded-lg border border-surface-border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
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
                                                </div>

                                                {/* Masking Type */}
                                                <div>
                                                    <label className="block text-xs text-text-tertiary mb-2">Masking Type</label>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleMaskingTypeChange(column, 'MASK_ALL')}
                                                            className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-all ${rule.type === 'MASK_ALL'
                                                                    ? 'border-primary bg-primary/20 text-primary'
                                                                    : 'border-surface-border bg-surface/30 text-text-secondary hover:border-primary/50'
                                                                }`}
                                                        >
                                                            <span className="material-symbols-outlined text-lg">lock</span>
                                                            Full Mask
                                                        </button>
                                                        <button
                                                            onClick={() => handleMaskingTypeChange(column, 'PARTIAL')}
                                                            className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-all ${rule.type === 'PARTIAL'
                                                                    ? 'border-primary bg-primary/20 text-primary'
                                                                    : 'border-surface-border bg-surface/30 text-text-secondary hover:border-primary/50'
                                                                }`}
                                                        >
                                                            <span className="material-symbols-outlined text-lg">lock_open</span>
                                                            Partial Mask
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Preset Patterns (for PARTIAL only) */}
                                                {rule.type === 'PARTIAL' && (
                                                    <div>
                                                        <label className="block text-xs text-text-tertiary mb-2">Pattern Presets</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {PRESET_PATTERNS.map((preset) => (
                                                                <button
                                                                    key={preset.id}
                                                                    onClick={() => handlePresetSelect(column, preset.pattern)}
                                                                    className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${rule.pattern === preset.pattern
                                                                            ? 'border-primary bg-primary/20 text-primary'
                                                                            : 'border-surface-border bg-surface/30 text-text-secondary hover:border-primary/50'
                                                                        }`}
                                                                >
                                                                    {preset.label}
                                                                    {preset.preview && (
                                                                        <span className="ml-1 text-text-tertiary">({preset.preview})</span>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {/* Custom Pattern Input */}
                                                        <div className="mt-3">
                                                            <label className="block text-xs text-text-tertiary mb-1">Custom Pattern</label>
                                                            <input
                                                                type="text"
                                                                value={rule.pattern || ''}
                                                                onChange={(e) => handleMaskingPatternChange(column, e.target.value)}
                                                                placeholder="e.g., ShowFirst4, ShowLast4, ***@***.com"
                                                                className="w-full rounded-lg border border-surface-border bg-surface-elevated/50 px-3 py-2 text-sm text-white placeholder-text-tertiary focus:border-primary focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Live Preview */}
                                                <div className="rounded-lg border border-surface-border bg-surface/50 p-3">
                                                    <label className="block text-xs text-text-tertiary mb-2">Preview</label>
                                                    <div className="flex items-center gap-3 font-mono text-sm">
                                                        <span className="text-white">{sampleValue}</span>
                                                        <span className="material-symbols-outlined text-lg text-text-tertiary">arrow_forward</span>
                                                        <span className="text-green-400">{maskedValue}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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
