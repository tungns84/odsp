import React from 'react';
import type { ConnectorStats as ConnectorStatsType } from '../../../types/connector';

interface StatsCardsProps {
    stats: ConnectorStatsType;
}

/**
 * StatsCards Component
 * 
 * Displays a set of cards showing statistics about the connectors.
 * - Total Connectors
 * - Active Connectors
 * - Pending Approval Connectors
 * 
 * @param stats - The statistics object containing total, active, and pending counts.
 */
export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-surface-border-subtle bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <span className="material-symbols-outlined text-primary">dns</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-text-tertiary">Total Connectors</p>
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                </div>
            </div>
            <div className="rounded-xl border border-surface-border-subtle bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                        <span className="material-symbols-outlined text-green-500">check_circle</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-text-tertiary">Active Connectors</p>
                        <p className="text-2xl font-bold text-white">{stats.active}</p>
                    </div>
                </div>
            </div>
            <div className="rounded-xl border border-surface-border-subtle bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                        <span className="material-symbols-outlined text-amber-500">pending</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-text-tertiary">Pending Approval</p>
                        <p className="text-2xl font-bold text-white">{stats.pendingApproval}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
