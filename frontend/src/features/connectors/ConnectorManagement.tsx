import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatsCards } from './components/StatsCards';
import { ConnectorFilters } from './components/ConnectorFilters';
import { ConnectorTable } from './components/ConnectorTable';
import { ConnectorWizard } from './components/ConnectorWizard';
import { ConnectorDetails } from './components/ConnectorDetails';

import type { Connector, ConnectorStats, ConnectorFilters as ConnectorFiltersType } from '../../types/connectorTypes';
import { mockAuditLogs } from '../../data';
import { useConnectors } from '../../hooks/useConnectors';

const initialFilters: ConnectorFiltersType = {
    search: '',
    type: '',
    status: '',
    createdDate: ''
};

export const ConnectorManagement: React.FC = () => {
    const navigate = useNavigate();
    const {
        connectors,
        loading,
        error,
        refresh,
        createConnector,
        updateConnector,
        deleteConnector,
        approveConnector,
        rejectConnector
    } = useConnectors();

    const [filters, setFilters] = useState<ConnectorFiltersType>(initialFilters);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
    const [editingConnector, setEditingConnector] = useState<Connector | null>(null);

    // Memoize stats to avoid recalculation on every render
    const stats = useMemo<ConnectorStats>(() => ({
        total: connectors.length,
        active: connectors.filter(c => c.status === 'APPROVED').length,
        pendingApproval: connectors.filter(c => c.status === 'INIT').length
    }), [connectors]);

    // Memoize filtered connectors - only recalculate when connectors or filters change
    const filteredConnectors = useMemo(() =>
        connectors.filter(connector => {
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
        }),
        [connectors, filters]
    );

    // Stable callbacks using useCallback
    const handleClearFilters = useCallback(() => {
        setFilters(initialFilters);
    }, []);

    const handleView = useCallback((id: string) => {
        const connector = connectors.find(c => c.id === id);
        if (connector) {
            setSelectedConnector(connector);
        }
    }, [connectors]);

    const handleDelete = useCallback(async (id: string) => {
        try {
            await deleteConnector(id);
            setSelectedConnector(null);
        } catch (err) {
            alert('Failed to delete connector. Please try again.');
        }
    }, [deleteConnector]);

    const handleApprove = useCallback(async (id: string) => {
        try {
            await approveConnector(id);
        } catch (err) {
            alert('Failed to approve connector. Please try again.');
        }
    }, [approveConnector]);

    const handleReject = useCallback(async (id: string) => {
        try {
            await rejectConnector(id);
        } catch (err) {
            alert('Failed to reject connector. Please try again.');
        }
    }, [rejectConnector]);

    const handleCreateSubmit = useCallback(async (data: Omit<Connector, 'id' | 'status' | 'createdAt' | 'tenantId'>) => {
        try {
            await createConnector(data);
            setIsCreateModalOpen(false);
        } catch (err) {
            alert('Failed to create connector. Please try again.');
        }
    }, [createConnector]);

    const handleEdit = useCallback((id: string) => {
        const connector = connectors.find(c => c.id === id);
        if (connector) {
            setEditingConnector(connector);
            setSelectedConnector(null);
        }
    }, [connectors]);

    const handleEditSubmit = useCallback(async (id: string, data: Omit<Connector, 'id' | 'status' | 'createdAt' | 'tenantId'>) => {
        try {
            await updateConnector(id, data);
            setEditingConnector(null);
        } catch (err) {
            alert('Failed to update connector. Please try again.');
        }
    }, [updateConnector]);

    // Stable callbacks for inline JSX handlers
    const handleNavigateCreateEndpoint = useCallback(() => {
        navigate('/data-endpoints/create');
    }, [navigate]);

    const handleOpenCreateModal = useCallback(() => {
        setIsCreateModalOpen(true);
    }, []);

    const handleCloseCreateModal = useCallback(() => {
        setIsCreateModalOpen(false);
    }, []);

    const handleCloseDetails = useCallback(() => {
        setSelectedConnector(null);
    }, []);

    const handleCloseEditWizard = useCallback(() => {
        setEditingConnector(null);
    }, []);

    const handleTestConnection = useCallback((id: string) => {
        console.log('Test connection:', id);
    }, []);

    const handleCreateEndpointFromDetails = useCallback((connectorId: string) => {
        navigate(`/data-endpoints/create?connectorId=${connectorId}`);
    }, [navigate]);

    return (
        <>
            {/* Page Heading */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Connector Management</h1>
                <div className="flex gap-3">
                    <button
                        onClick={handleNavigateCreateEndpoint}
                        className="flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Create Data Endpoint
                    </button>
                    <button
                        onClick={handleOpenCreateModal}
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
                            onClick={refresh}
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
                onClose={handleCloseCreateModal}
                onSubmit={handleCreateSubmit}
            />

            {/* Details Modal */}
            {selectedConnector && (
                <ConnectorDetails
                    connector={selectedConnector}
                    auditLogs={mockAuditLogs}
                    onClose={handleCloseDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onTestConnection={handleTestConnection}
                    onCreateEndpoint={handleCreateEndpointFromDetails}
                />
            )}

            {/* Edit Wizard */}
            {editingConnector && (
                <ConnectorWizard
                    isOpen={true}
                    onClose={handleCloseEditWizard}
                    onSubmit={(data) => handleEditSubmit(editingConnector.id, data)}
                    initialData={editingConnector}
                />
            )}
        </>
    );
};
