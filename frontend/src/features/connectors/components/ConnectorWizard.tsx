import React, { useState } from 'react';
import { WizardStep1ConnectionDetails } from './WizardStep1ConnectionDetails';
import { WizardStep2TableSelection } from './WizardStep2TableSelection';
import type { WizardStep1FormValues, TableSelectionFormValues } from '../schemas';
import type { Connector, TableMetadata } from '../../../types/connector';

interface ConnectorWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Connector, 'id' | 'status' | 'createdAt'>) => void;
}

export const ConnectorWizard: React.FC<ConnectorWizardProps> = ({
    isOpen,
    onClose,
    onSubmit
}) => {
    const [step, setStep] = useState(1);
    const [step1Data, setStep1Data] = useState<Partial<WizardStep1FormValues>>({});
    const [availableTables, setAvailableTables] = useState<TableMetadata[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                config: step1Data.config,
                registeredTables: data.registeredTables
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
    React.useEffect(() => {
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-3xl rounded-xl border border-surface-border-subtle bg-surface p-6 shadow-xl h-[85vh] flex flex-col">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-2">Create New Connector</h2>

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
