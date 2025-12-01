import React from 'react';

interface WizardLayoutProps {
    children: React.ReactNode;
    currentStep: number;
    totalSteps: number;
    stepTitle: string;
    onNext: () => void;
    onBack: () => void;
    onCancel: () => void;
    onSave: () => void;
    showSave?: boolean;
    hideBack?: boolean;
}

export const WizardLayout: React.FC<WizardLayoutProps> = ({
    children,
    currentStep,
    totalSteps,
    stepTitle,
    onNext,
    onBack,
    onCancel,
    onSave,
    showSave = false,
    hideBack = false
}) => {
    return (
        <div className="min-h-screen bg-surface p-6">
            <div className="mx-auto max-w-4xl">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                            <React.Fragment key={step}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${step === currentStep
                                                ? 'border-primary bg-primary text-white'
                                                : step < currentStep
                                                    ? 'border-green-500 bg-green-500 text-white'
                                                    : 'border-surface-border bg-surface-elevated text-text-tertiary'
                                            }`}
                                    >
                                        {step < currentStep ? (
                                            <span className="material-symbols-outlined text-lg">check</span>
                                        ) : (
                                            <span className="font-bold">{step}</span>
                                        )}
                                    </div>
                                    <span className="mt-2 text-xs text-text-tertiary">Step {step}</span>
                                </div>
                                {step < totalSteps && (
                                    <div
                                        className={`h-0.5 flex-1 ${step < currentStep ? 'bg-green-500' : 'bg-surface-border'
                                            }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content Card */}
                <div className="rounded-xl border border-surface-border-subtle bg-surface p-8 shadow-xl">
                    <h2 className="mb-6 text-2xl font-bold text-white">{stepTitle}</h2>
                    <div className="mb-8">{children}</div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between">
                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                className="rounded-lg border border-surface-border px-6 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated"
                            >
                                Cancel
                            </button>
                            {!hideBack && currentStep > 1 && (
                                <button
                                    onClick={onBack}
                                    className="rounded-lg border border-surface-border px-6 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated"
                                >
                                    Back
                                </button>
                            )}
                        </div>
                        <div>
                            {showSave ? (
                                <button
                                    onClick={onSave}
                                    className="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary/90"
                                >
                                    Save Endpoint
                                </button>
                            ) : (
                                <button
                                    onClick={onNext}
                                    className="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary/90"
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
