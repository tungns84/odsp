import { X, AlertTriangle } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiKeyService } from '../../services/apiKeyService';
import type { ApiKeyCreationResponse } from '../../types/apiKeyTypes';
import { GenerateApiKeySchema, type GenerateApiKeyFormValues } from '../apiKeys/schemas';
import { FormField, FormInput } from '../../components/forms';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (key: ApiKeyCreationResponse) => void;
    tenantId: string;
}

export function GenerateApiKeyModal({ isOpen, onClose, onSuccess, tenantId }: Props) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError
    } = useForm<GenerateApiKeyFormValues>({
        resolver: zodResolver(GenerateApiKeySchema),
        defaultValues: {
            name: '',
            expiresAt: ''
        }
    });

    if (!isOpen) return null;

    const onSubmit = async (data: GenerateApiKeyFormValues) => {
        try {
            const response = await apiKeyService.generateApiKey(tenantId, {
                name: data.name,
                expiresAt: data.expiresAt || undefined
            });
            onSuccess(response.data);
            reset();
        } catch (err: any) {
            setError('root', {
                message: err.response?.data?.message || 'Failed to generate API key'
            });
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg border border-surface-border bg-surface p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text-primary">Generate API Key</h2>
                    <button onClick={handleClose} className="text-text-secondary hover:text-text-primary">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-6 p-4 bg-warning-bg rounded-lg border border-warning-border flex gap-3">
                    <AlertTriangle className="text-warning shrink-0" size={24} />
                    <p className="text-sm text-warning">
                        The API key will be displayed only once. Please make sure to save it in a secure location.
                    </p>
                </div>

                {errors.root && (
                    <div className="mb-4 rounded-lg bg-error-bg border border-error-border p-3 text-sm text-error">
                        {errors.root.message}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <FormField
                                label="Key Name"
                                error={errors.name?.message}
                                required
                                htmlFor="api-key-name"
                            >
                                <FormInput
                                    {...field}
                                    id="api-key-name"
                                    type="text"
                                    error={!!errors.name}
                                    placeholder="e.g., Production App"
                                />
                            </FormField>
                        )}
                    />

                    <Controller
                        name="expiresAt"
                        control={control}
                        render={({ field }) => (
                            <FormField
                                label="Expiration Date"
                                error={errors.expiresAt?.message}
                                htmlFor="api-key-expires"
                            >
                                <FormInput
                                    {...field}
                                    id="api-key-expires"
                                    type="date"
                                    error={!!errors.expiresAt}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </FormField>
                        )}
                    />

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 rounded-lg border border-surface-border text-text-secondary hover:bg-surface-elevated transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
