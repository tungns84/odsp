// CreateDataEndpointWizard.tsx
// This wizard loads connectors from the backend via connectorService.

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WizardLayout } from './components/WizardLayout';
import { Step1SelectConnector } from './components/Step1SelectConnector';
import { Step2DefineSource } from './components/Step2DefineSource';
import { Step3BuildQuery } from './components/Step3BuildQuery';
import { Step4Preview } from './components/Step4Preview';
import { Step4Finalize } from './components/Step4Finalize';
import type { WizardState, QueryConfig } from '../../types/dataEndpoint';
import type { Connector, TableMetadata } from '../../types/connector';
import { connectorService, dataEndpointService } from '../../services';

export const CreateDataEndpointWizard: React.FC = () => {
    // URL param – pre‑selected connector id (used when wizard is opened from a connector view)
    const [searchParams] = useSearchParams();
    const preSelectedConnectorId = searchParams.get('connectorId');

    // Wizard state (same shape as before)
    const [wizardState, setWizardState] = useState<WizardState>({
        currentStep: preSelectedConnectorId ? 2 : 1, // skip step 1 if a connector is pre‑selected
        selectedConnectorId: preSelectedConnectorId,
        sourceType: 'table',
        tableName: '',
        selectedColumns: [],
        filters: [],
        sortOrder: null,
        customSQL: '',
        maskingConfig: {},
        endpointName: '',
        description: '',
    });

    // UI helpers for a pre‑selected connector name (display only)
    const [preSelectedConnectorName, setPreSelectedConnectorName] = useState<string>('');

    // Connectors loaded from the backend
    const [connectors, setConnectors] = useState<Connector[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Tables loaded for the selected connector
    const [tables, setTables] = useState<TableMetadata[]>([]);

    // ---------------------------------------------------------------------
    // Load connectors from the API
    // ---------------------------------------------------------------------
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

    // Load tables for the selected connector - use only registered tables
    const loadTables = (connectorId: string) => {
        const connector = connectors.find(c => c.id === connectorId);
        if (connector && connector.registeredTables) {
            setTables(connector.registeredTables);
        } else {
            setTables([]);
            console.warn(`Connector ${connectorId} has no registered tables`);
        }
    };

    // Initial load
    useEffect(() => {
        loadConnectors();
    }, []);

    // Resolve the name of a pre‑selected connector once we have the list
    useEffect(() => {
        if (preSelectedConnectorId && connectors.length > 0) {
            const conn = connectors.find(c => c.id === preSelectedConnectorId);
            if (conn) {
                setPreSelectedConnectorName(conn.name);
                loadTables(preSelectedConnectorId);
            }
        }
    }, [preSelectedConnectorId, connectors]);

    // Load tables when connector is selected in step 1
    useEffect(() => {
        if (wizardState.selectedConnectorId && !preSelectedConnectorId && connectors.length > 0) {
            loadTables(wizardState.selectedConnectorId);
        }
    }, [wizardState.selectedConnectorId, preSelectedConnectorId, connectors]);

    // ---------------------------------------------------------------------
    // Navigation helpers (unchanged logic, only state shape matters)
    // ---------------------------------------------------------------------
    // ---------------------------------------------------------------------
    // Helper: Generate SQL from wizard state
    // ---------------------------------------------------------------------
    // ---------------------------------------------------------------------
    // Helper: Build QueryConfig from wizard state
    // ---------------------------------------------------------------------
    const buildQueryConfig = (): QueryConfig => {
        if (wizardState.sourceType === 'customSQL') {
            return {
                mode: 'SQL',
                sql: wizardState.customSQL
            };
        }

        return {
            mode: 'BUILDER',
            rootTable: wizardState.tableName,
            columns: wizardState.selectedColumns.map(col => ({
                table: wizardState.tableName,
                name: col
            })),
            filters: wizardState.filters,
            sort: wizardState.sortOrder ? [wizardState.sortOrder] : undefined
        };
    };

    // ---------------------------------------------------------------------
    // Navigation helpers
    // ---------------------------------------------------------------------
    const handleNext = () => {
        // Validation per step
        if (wizardState.currentStep === 1 && !wizardState.selectedConnectorId) {
            alert('Please select a connector');
            return;
        }
        if (wizardState.currentStep === 2) {
            if (wizardState.sourceType === 'table' && !wizardState.tableName) {
                alert('Please select a table');
                return;
            }
            if (wizardState.sourceType === 'customSQL' && !wizardState.customSQL) {
                alert('Please enter a SQL query');
                return;
            }
        }
        if (wizardState.currentStep === 3 && wizardState.selectedColumns.length === 0) {
            alert('Please select at least one column');
            return;
        }

        // Skip step 3 when using custom SQL
        if (wizardState.currentStep === 2 && wizardState.sourceType === 'customSQL') {
            setWizardState(prev => ({ ...prev, currentStep: 4 }));
        } else {
            setWizardState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
        }
    };

    const handleBack = () => {
        // Skip step 3 when going back from step 4 in custom SQL mode
        if (wizardState.currentStep === 4 && wizardState.sourceType === 'customSQL') {
            setWizardState(prev => ({ ...prev, currentStep: 2 }));
        } else if (wizardState.currentStep === 2 && preSelectedConnectorId) {
            // cannot go back to step 1 when a connector was pre‑selected
            return;
        } else {
            setWizardState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
        }
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel? All progress will be lost.')) {
            window.history.back();
        }
    };

    const handleSave = async () => {
        if (!wizardState.endpointName) {
            alert('Please enter an endpoint name');
            return;
        }

        try {
            const queryConfig = buildQueryConfig();

            await dataEndpointService.create({
                name: wizardState.endpointName,
                description: wizardState.description,
                connectorId: wizardState.selectedConnectorId!,
                queryConfig,
                maskingConfig: Object.keys(wizardState.maskingConfig).length > 0
                    ? wizardState.maskingConfig
                    : undefined
            });

            alert('Endpoint created successfully!');
            window.history.back();
        } catch (err: any) {
            console.error('Failed to create endpoint:', err);
            alert(err.response?.data?.error || err.response?.data?.message || 'Failed to create endpoint');
        }
    };

    // ---------------------------------------------------------------------
    // UI helpers
    // ---------------------------------------------------------------------
    const getStepTitle = () => {
        switch (wizardState.currentStep) {
            case 1:
                return 'Select Connector';
            case 2:
                return preSelectedConnectorId ? `Define Source - ${preSelectedConnectorName}` : 'Define Source';
            case 3:
                return 'Build Query';
            case 4:
                return 'Preview Data';
            case 5:
                return 'Finalize';
            default:
                return '';
        }
    };

    const renderStep = () => {
        switch (wizardState.currentStep) {
            case 1:
                return (
                    <Step1SelectConnector
                        connectors={connectors}
                        selectedConnectorId={wizardState.selectedConnectorId}
                        onSelect={id => setWizardState(prev => ({ ...prev, selectedConnectorId: id }))}
                    />
                );
            case 2:
                return (
                    <Step2DefineSource
                        sourceType={wizardState.sourceType}
                        tableName={wizardState.tableName}
                        customSQL={wizardState.customSQL}
                        tables={tables}
                        connectorId={wizardState.selectedConnectorId}
                        onSourceTypeChange={type => setWizardState(prev => ({ ...prev, sourceType: type }))}
                        onTableNameChange={name => setWizardState(prev => ({ ...prev, tableName: name, selectedColumns: [] }))}
                        onCustomSQLChange={sql => setWizardState(prev => ({ ...prev, customSQL: sql }))}
                    />
                );
            case 3:
                const selectedTable = tables.find(t => t.name === wizardState.tableName);
                const columns = selectedTable ? selectedTable.columns.map(c => c.name) : [];
                return (
                    <Step3BuildQuery
                        tableName={wizardState.tableName}
                        columns={columns}
                        selectedColumns={wizardState.selectedColumns}
                        filters={wizardState.filters}
                        sortOrder={wizardState.sortOrder}
                        maskingConfig={wizardState.maskingConfig}
                        onColumnsChange={cols => setWizardState(prev => ({ ...prev, selectedColumns: cols }))}
                        onFiltersChange={filters => setWizardState(prev => ({ ...prev, filters }))}
                        onSortOrderChange={sort => setWizardState(prev => ({ ...prev, sortOrder: sort }))}
                        onMaskingConfigChange={config => setWizardState(prev => ({ ...prev, maskingConfig: config }))}
                    />
                );
            case 4:
                return (
                    <Step4Preview
                        connectorId={wizardState.selectedConnectorId}
                        queryConfig={buildQueryConfig()}
                        tables={tables}
                    />
                );
            case 5:
                return (
                    <Step4Finalize
                        wizardState={wizardState}
                        connectors={connectors}
                        endpointName={wizardState.endpointName}
                        description={wizardState.description}
                        onEndpointNameChange={name => setWizardState(prev => ({ ...prev, endpointName: name }))}
                        onDescriptionChange={desc => setWizardState(prev => ({ ...prev, description: desc }))}
                    />
                );
            default:
                return null;
        }
    };

    // ---------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------
    return (
        <WizardLayout
            currentStep={wizardState.currentStep}
            totalSteps={5}
            stepTitle={`Create Data Endpoint - ${getStepTitle()}`}
            onNext={handleNext}
            onBack={handleBack}
            onCancel={handleCancel}
            onSave={handleSave}
            showSave={wizardState.currentStep === 5}
            hideBack={wizardState.currentStep === 2 && !!preSelectedConnectorId}
        >
            {/* Loading state */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm text-text-tertiary">Loading connectors…</p>
                    </div>
                </div>
            )}

            {/* Error state */}
            {error && !loading && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
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

            {/* Main wizard steps – only show when not loading/error */}
            {!loading && !error && renderStep()}
        </WizardLayout>
    );
};
