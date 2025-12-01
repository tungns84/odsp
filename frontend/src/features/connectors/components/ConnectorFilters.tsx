import React from 'react';
import type { ConnectorFilters as ConnectorFiltersType } from '../../../types/connector';

interface ConnectorFiltersProps {
    filters: ConnectorFiltersType;
    onFilterChange: (filters: ConnectorFiltersType) => void;
    onClearFilters: () => void;
}

export const ConnectorFilters: React.FC<ConnectorFiltersProps> = ({
    filters,
    onFilterChange,
    onClearFilters
}) => {
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ ...filters, search: e.target.value });
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({ ...filters, type: e.target.value });
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({ ...filters, status: e.target.value });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ ...filters, createdDate: e.target.value });
    };

    return (
        <div className="flex flex-col gap-4 rounded-lg border border-surface-border-subtle bg-slate-500/5 p-4">
            <div className="flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="relative flex-grow">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">search</span>
                    <input
                        className="w-full rounded-lg border-slate-200/20 bg-surface/50 py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:border-primary focus:ring-primary"
                        placeholder="Search by name..."
                        type="text"
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                </div>

                {/* Type Filter */}
                <select
                    className="rounded-lg border-slate-200/20 bg-surface/50 text-white focus:border-primary focus:ring-primary"
                    value={filters.type}
                    onChange={handleTypeChange}
                >
                    <option value="">Type: All</option>
                    <option value="DATABASE">Database</option>
                    <option value="API">API</option>
                    <option value="FILE_SYSTEM">File System</option>
                </select>

                {/* Status Filter */}
                <select
                    className="rounded-lg border-slate-200/20 bg-surface/50 text-white focus:border-primary focus:ring-primary"
                    value={filters.status}
                    onChange={handleStatusChange}
                >
                    <option value="">Status: All</option>
                    <option value="APPROVED">Active</option>
                    <option value="INIT">Pending Approval</option>
                    <option value="REJECTED">Rejected</option>
                </select>

                {/* Date Filter */}
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">calendar_month</span>
                    <input
                        className="w-full rounded-lg border-slate-200/20 bg-surface/50 py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:border-primary focus:ring-primary"
                        onBlur={(e) => e.target.type = 'text'}
                        onFocus={(e) => e.target.type = 'date'}
                        placeholder="Creation Date"
                        type="text"
                        value={filters.createdDate}
                        onChange={handleDateChange}
                    />
                </div>

                {/* Clear Filters */}
                <button
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent text-text-secondary text-sm font-medium leading-normal hover:bg-surface-elevated"
                    onClick={onClearFilters}
                >
                    <span className="truncate">Clear Filters</span>
                </button>
            </div>
        </div>
    );
};
