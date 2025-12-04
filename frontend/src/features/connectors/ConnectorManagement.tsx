import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatsCards } from './components/StatsCards';
import { ConnectorFilters } from './components/ConnectorFilters';
import { ConnectorTable } from './components/ConnectorTable';
import { ConnectorWizard } from './components/ConnectorWizard';
import { ConnectorDetails } from './components/ConnectorDetails';

import type { Connector, ConnectorStats, ConnectorFilters as ConnectorFiltersType } from '../../types/connector';
import { mockAuditLogs } from '../../data';
import { connectorService } from '../../services';

const initialFilters: ConnectorFiltersType = {
    search: '',
    type: '',
    status: '',
    createdDate: ''
};

export const ConnectorManagement: React.FC = () => {
    const navigate = useNavigate();
    const [connectors, setConnectors] = useState<Connector[]>([]);
    const [filters, setFilters] = useState<ConnectorFiltersType>(initialFilters);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
    const [editingConnector, setEditingConnector] = useState<Connector | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch connectors on mount
    useEffect(() => {
        loadConnectors();
    }, []);

    const loadConnectors = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await connectorService.getAll();
            setConnectors(response.data);
        } catch (err) {
            console.error('Failed to load connectors:', err);
            setError('Failed to load connectors. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const stats: ConnectorStats = {
        total: connectors.length,
        active: connectors.filter(c => c.status === 'APPROVED').length,
        pendingApproval: connectors.filter(c => c.status === 'INIT').length
    };

    const filteredConnectors = connectors.filter(connector => {
        if (filters.search && !connector.name.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
        }
        if (filters.type && connector.type !== filters.type) {
            return false;
        }
        if (filters.status && connector.status !== filters.status) {
            return false;
        }
        if (filters.createdDate && connector.createdAt !== filters.createdDate) {
            return false;
        }
        return true;
    });

    const handleClearFilters = () => {
        setFilters(initialFilters);
    };

    const handleView = (id: string) => {
        const connector = connectors.find(c => c.id === id);
        if (connector) {
            setSelectedConnector(connector);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await connectorService.delete(id);
            setConnectors(prev => prev.filter(c => c.id !== id));
            setSelectedConnector(null);
        } catch (err) {
            console.error('Failed to delete connector:', err);
            alert('Failed to delete connector. Please try again.');
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const response = await connectorService.updateApprovalStatus(id, 'APPROVED');
            setConnectors(prev => prev.map(c => c.id === id ? response.data : c));
        } catch (err) {
            console.error('Failed to approve connector:', err);
            alert('Failed to approve connector. Please try again.');
        }
    };

    const handleReject = async (id: string) => {
        try {
            const response = await connectorService.updateApprovalStatus(id, 'REJECTED');
            setConnectors(prev => prev.map(c => c.id === id ? response.data : c));
        } catch (err) {
            console.error('Failed to reject connector:', err);
            alert('Failed to reject connector. Please try again.');
        }
    };

    const handleCreateSubmit = async (data: Omit<Connector, 'id' | 'status' | 'createdAt' | 'tenantId'>) => {
        try {
            const response = await connectorService.create(data);
            setConnectors(prev => [response.data, ...prev]);
            setIsCreateModalOpen(false);
        } catch (err) {
            console.error('Failed to create connector:', err);
            alert('Failed to create connector. Please try again.');
        }
    };

    const handleEdit = (id: string) => {
        const connector = connectors.find(c => c.id === id);
        if (connector) {
            setEditingConnector(connector);
            setSelectedConnector(null);
        }
    };

    const handleEditSubmit = async (id: string, data: Omit<Connector, 'id' | 'status' | 'createdAt' | 'tenantId'>) => {
        try {
            const response = await connectorService.update(id, data);
            setConnectors(prev => prev.map(c => c.id === id ? response.data : c));
            setEditingConnector(null);
        } catch (err) {
            console.error('Failed to update connector:', err);
            alert('Failed to update connector. Please try again.');
        }
    };

    return (
        <>
            {/* Page Heading */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Connector Management</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/data-endpoints/create')}
                        className="flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Create Data Endpoint
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Create Connector
                    </button>
                </div>
            </div>

            {/* Stats */}
            <StatsCards stats={stats} />

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="text-sm text-text-tertiary">Loading connectors...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-500">error</span>
                        <div>
                            <p className="font-medium text-red-500">Error</p>
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                        <button
                            onClick={loadConnectors}
                            className="ml-auto rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            {!loading && !error && (
                <ConnectorFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    onClearFilters={handleClearFilters}
                />
            )}

            {/* Table */}
            {!loading && !error && (
                <ConnectorTable
                    connectors={filteredConnectors}
                    onView={handleView}
                    onDelete={handleDelete}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}

            {/* Create Wizard */}
            <ConnectorWizard
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateSubmit}
            />

            {/* Details Modal */}
            {selectedConnector && (
                <ConnectorDetails
                    connector={selectedConnector}
                    auditLogs={mockAuditLogs}
                    onClose={() => setSelectedConnector(null)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onTestConnection={(id) => {
                        console.log('Test connection:', id);
                    }}
                    onCreateEndpoint={(connectorId) => {
                        navigate(`/data-endpoints/create?connectorId=${connectorId}`);
                    }}
                />
            )}

            {/* Edit Wizard */}
            {editingConnector && (
                <ConnectorWizard
                    isOpen={true}
                    onClose={() => setEditingConnector(null)}
                    onSubmit={(data) => handleEditSubmit(editingConnector.id, data)}
                    initialData={editingConnector}
                />
            )}
        </>
    );
};
