import { X, Calendar } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiKeyService } from '../../services/apiKeyService';
import type { ApiKeyCreationResponse } from '../../types/apiKeyTypes';
import { GenerateApiKeySchema, type GenerateApiKeyFormValues } from './schemas';
import { FormField, FormInput } from '../../components/forms';

interface Props {
    tenantId: string;
    onClose: () => void;
    onSuccess: (response: ApiKeyCreationResponse) => void;
}

export function GenerateApiKeyModal({ tenantId, onClose, onSuccess }: Props) {
    const {
        control,
        handleSubmit,
        setValue,
        watch,
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

    const expiresAt = watch('expiresAt');

    const handleExpirationChange = (days: number | null) => {
        if (days === null) {
            setValue('expiresAt', '');
        } else {
            const date = new Date();
            date.setDate(date.getDate() + days);
            setValue('expiresAt', date.toISOString().slice(0, 16));
        }
    };

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface border border-surface-border rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">Generate API Key</h2>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-surface-elevated rounded-lg transition-colors text-text-secondary"
                    >
                        <X size={20} />
                    </button>
                </div>

                {errors.root && (
                    <div className="mb-4 p-3 bg-error-bg border border-error-border rounded-lg text-error text-sm">
                        {errors.root.message}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    label="Key Name"
                                    error={errors.name?.message}
                                    required
                                    htmlFor="apikey-name"
                                >
                                    <FormInput
                                        {...field}
                                        id="apikey-name"
                                        type="text"
                                        error={!!errors.name}
                                        placeholder="e.g., Production Service Key"
                                    />
                                </FormField>
                            )}
                        />

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Expiration</label>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                                <button
                                    type="button"
                                    onClick={() => handleExpirationChange(30)}
                                    className="px-3 py-2 text-sm rounded-lg border transition-colors bg-surface-elevated border-surface-border text-text-secondary hover:border-primary/50"
                                >
                                    30 Days
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExpirationChange(90)}
                                    className="px-3 py-2 text-sm rounded-lg border transition-colors bg-surface-elevated border-surface-border text-text-secondary hover:border-primary/50"
                                >
                                    90 Days
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExpirationChange(null)}
                                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${!expiresAt
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-surface-elevated border-surface-border text-text-secondary hover:border-primary/50'
                                        }`}
                                >
                                    Never
                                </button>
                            </div>
                            <Controller
                                name="expiresAt"
                                control={control}
                                render={({ field }) => (
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={18} />
                                        <input
                                            {...field}
                                            type="datetime-local"
                                            className="w-full pl-10 pr-4 py-2 bg-surface-elevated border border-surface-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring"
                                        />
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 bg-surface-elevated hover:bg-surface-elevated/80 text-text-primary rounded-lg transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Generating...' : 'Generate Key'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
