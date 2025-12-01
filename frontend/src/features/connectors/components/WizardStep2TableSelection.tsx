import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TableSelectionSchema, type TableSelectionFormValues } from '../schemas';
import type { TableMetadata } from '../../../types/connector';

interface WizardStep2Props {
    availableTables: TableMetadata[];
    onBack: () => void;
    onSubmit: (data: TableSelectionFormValues) => void;
    isSubmitting: boolean;
}

export const WizardStep2TableSelection: React.FC<WizardStep2Props> = ({
    availableTables,
    onBack,
    onSubmit,
    isSubmitting
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<TableSelectionFormValues>({
        resolver: zodResolver(TableSelectionSchema),
        defaultValues: {
            registeredTables: []
        }
    });

    const selectedTables = watch('registeredTables');

    const filteredTables = useMemo(() => {
        return availableTables.filter(table =>
            table.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableTables, searchTerm]);

    const toggleTableSelection = (table: TableMetadata) => {
        const isSelected = selectedTables.some(t => t.name === table.name);
        if (isSelected) {
            setValue('registeredTables', selectedTables.filter(t => t.name !== table.name));
        } else {
            setValue('registeredTables', [...selectedTables, table]);
        }
    };

    const handleSelectAll = () => {
        setValue('registeredTables', filteredTables);
    };

    const handleDeselectAll = () => {
        setValue('registeredTables', []);
    };

    const toggleExpand = (tableName: string) => {
        const newExpanded = new Set(expandedTables);
        if (newExpanded.has(tableName)) {
            newExpanded.delete(tableName);
        } else {
            newExpanded.add(tableName);
        }
        setExpandedTables(newExpanded);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 h-full">
            <div className="flex flex-col gap-4 flex-1 min-h-0">
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">search</span>
                        <input
                            type="text"
                            placeholder="Search tables..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-surface-border bg-surface-elevated/50 py-2 pl-10 pr-4 text-sm text-white focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="text-xs font-medium text-primary hover:text-primary/80"
                        >
                            Select All
                        </button>
                        <span className="text-slate-600">|</span>
                        <button
                            type="button"
                            onClick={handleDeselectAll}
                            className="text-xs font-medium text-text-tertiary hover:text-text-primary"
                        >
                            Deselect All
                        </button>
                    </div>
                </div>

                {errors.registeredTables && (
                    <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                        {errors.registeredTables.message}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto rounded-lg border border-surface-border/50 bg-surface/30">
                    {filteredTables.length === 0 ? (
                        <div className="flex h-full items-center justify-center p-8 text-text-tertiary">
                            No tables found matching your search.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700/50">
                            {filteredTables.map((table) => {
                                const isSelected = selectedTables.some(t => t.name === table.name);
                                const isExpanded = expandedTables.has(table.name);

                                return (
                                    <div key={table.name} className="group">
                                        <div className={`flex items-center gap-3 p-3 hover:bg-surface-elevated/50 ${isSelected ? 'bg-primary/5' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleTableSelection(table)}
                                                className="h-4 w-4 rounded border-surface-border bg-surface-border text-primary focus:ring-primary"
                                            />
                                            <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(table.name)}>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-200">{table.name}</span>
                                                    <span className="text-xs text-text-tertiary">({table.columns.length} columns)</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleExpand(table.name)}
                                                className="text-text-tertiary hover:text-text-primary"
                                            >
                                                <span className="material-symbols-outlined text-lg">
                                                    {isExpanded ? 'expand_less' : 'expand_more'}
                                                </span>
                                            </button>
                                        </div>

                                        {isExpanded && (
                                            <div className="bg-surface/50 px-10 py-3">
                                                <div className="grid grid-cols-1 gap-2 text-xs">
                                                    {table.columns.map(col => (
                                                        <div key={col.name} className="flex items-center justify-between border-b border-slate-800 pb-2">
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <span className="text-text-secondary font-medium">{col.displayName || col.name}</span>
                                                                {col.isPrimaryKey && (
                                                                    <span className="px-1.5 py-0.5 text-[10px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded">PK</span>
                                                                )}
                                                                {col.isForeignKey && (
                                                                    <span className="px-1.5 py-0.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded">FK</span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {col.semanticType && (
                                                                    <span className="px-1.5 py-0.5 text-[10px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded">{col.semanticType}</span>
                                                                )}
                                                                <span className="font-mono text-text-tertiary">{col.dataType}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="text-xs text-text-tertiary text-right">
                    Selected: {selectedTables.length} tables
                </div>
            </div>

            <div className="flex justify-between gap-3 pt-4 border-t border-surface-border/50">
                <button
                    type="button"
                    onClick={onBack}
                    className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated"
                >
                    Back
                </button>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => onSubmit({ registeredTables: [] })} // Cancel action
                        className="rounded-lg px-4 py-2 text-sm font-medium text-text-tertiary hover:bg-surface-elevated hover:text-text-primary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Connector'}
                    </button>
                </div>
            </div>
        </form>
    );
};
