import React, { useState, useEffect } from 'react';
import { WizardStep1ConnectionDetails } from './WizardStep1ConnectionDetails';
import { WizardStep2TableSelection } from './WizardStep2TableSelection';
import type { WizardStep1FormValues, TableSelectionFormValues } from '../schemas';
import type { Connector, TableMetadata } from '../../../types/connector';
import { connectorService } from '../../../services/connectorService';

interface ConnectorWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Connector, 'id' | 'status' | 'createdAt' | 'tenantId'>) => void;
    initialData?: Connector; // Can be summary or detail
}

export const ConnectorWizard: React.FC<ConnectorWizardProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData
}) => {
    const [step, setStep] = useState(1);
    const [step1Data, setStep1Data] = useState<Partial<WizardStep1FormValues>>({});
    const [availableTables, setAvailableTables] = useState<TableMetadata[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch full details if initialData is provided (edit mode)
    useEffect(() => {
        const fetchDetails = async () => {
            if (isOpen && initialData?.id) {
                setIsLoading(true);
                try {
                    const response = await connectorService.getById(initialData.id);
                    const fullConnector = response.data;
                    setStep1Data({
                        name: fullConnector.name,
                        type: fullConnector.type,
                        config: fullConnector.config as any
                    });
                    // availableTables will be populated when user clicks Next in Step 1 (triggers test connection)
                } catch (error) {
                    console.error('Failed to fetch connector details:', error);
                } finally {
                    setIsLoading(false);
                }
            } else if (isOpen && !initialData) {
                // Reset for create mode
                setStep1Data({});
                setAvailableTables([]);
                setStep(1);
            }
        };

        fetchDetails();
    }, [isOpen, initialData]);

    const handleStep1Next = (data: WizardStep1FormValues, tables: TableMetadata[]) => {
        setStep1Data(data);
        setAvailableTables(tables);
        setStep(2);
    };

    const handleStep2Submit = async (data: TableSelectionFormValues) => {
        if (!step1Data.name || !step1Data.type) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                name: step1Data.name,
                type: step1Data.type,
                config: step1Data.config!,
                registeredTables: data.registeredTables,
                isActive: initialData?.isActive ?? true
            });
            // Reset and close
            setStep(1);
            setStep1Data({});
            setAvailableTables([]);
            onClose();
        } catch (error) {
            console.error('Failed to create connector:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setStep1Data({});
        setAvailableTables([]);
        onClose();
    };

    // Handle Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4 text-white">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <p>Loading connector details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-3xl rounded-xl border border-surface-border-subtle bg-surface p-6 shadow-xl h-[85vh] flex flex-col">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-2">
                        {initialData ? 'Edit Connector' : 'Create New Connector'}
                    </h2>

                    {/* Stepper */}
                    <div className="flex items-center gap-4 text-sm">
                        <div className={`flex items-center gap-2 ${step === 1 ? 'text-primary font-bold' : 'text-green-500'}`}>
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${step === 1 ? 'border-primary bg-primary/10' : 'border-green-500 bg-green-500/10'}`}>
                                {step > 1 ? <span className="material-symbols-outlined text-sm">check</span> : '1'}
                            </div>
                            Connection Details
                        </div>
                        <div className="h-px w-8 bg-surface-border"></div>
                        <div className={`flex items-center gap-2 ${step === 2 ? 'text-primary font-bold' : 'text-text-tertiary'}`}>
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${step === 2 ? 'border-primary bg-primary/10' : 'border-surface-border bg-surface-elevated'}`}>
                                2
                            </div>
                            Select Tables
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto pr-2">
                    {step === 1 && (
                        <WizardStep1ConnectionDetails
                            initialValues={step1Data}
                            onNext={handleStep1Next}
                            onCancel={handleClose}
                        />
                    )}

                    {step === 2 && (
                        <WizardStep2TableSelection
                            availableTables={availableTables}
                            onBack={() => setStep(1)}
                            onSubmit={handleStep2Submit}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
