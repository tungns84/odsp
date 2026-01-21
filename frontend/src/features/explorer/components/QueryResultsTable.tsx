interface QueryResultsTableProps {
    columns: string[];
    rows: Record<string, any>[];
    rowCount: number;
    loading?: boolean;
}

export function QueryResultsTable({ columns, rows, rowCount, loading = false }: QueryResultsTableProps) {
    return (
        <div className="rounded-xl border border-surface-border bg-surface shadow-sm overflow-hidden">
            {/* Header */}
            <div className="border-b border-surface-border px-6 py-4 flex items-center justify-between bg-surface-elevated/30">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-secondary">
                        Query Results
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                        {rowCount} {rowCount === 1 ? 'row' : 'rows'}
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-sm text-left">
                    <thead className="bg-surface-elevated text-xs uppercase text-text-secondary sticky top-0">
                        <tr>
                            {columns.length > 0 ? (
                                columns.map(col => (
                                    <th key={col} className="px-6 py-3 font-medium whitespace-nowrap">
                                        {col}
                                    </th>
                                ))
                            ) : (
                                <th className="px-6 py-3">No columns</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                        {loading ? (
                            // Loading Skeleton
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {Array.from({ length: Math.max(columns.length, 3) }).map((_, j) => (
                                        <td key={j} className="px-6 py-4">
                                            <div className="h-4 w-24 rounded bg-surface-elevated"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : rows.length > 0 ? (
                            rows.map((row, i) => (
                                <tr key={i} className="hover:bg-surface-elevated/50 transition-colors">
                                    {columns.map(col => (
                                        <td key={col} className="px-6 py-4 text-text-secondary whitespace-nowrap">
                                            {row[col] !== null && row[col] !== undefined ?
                                                String(row[col]) :
                                                <span className="italic text-text-tertiary">null</span>
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={Math.max(columns.length, 1)} className="px-6 py-12 text-center text-text-tertiary">
                                    No data returned
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
