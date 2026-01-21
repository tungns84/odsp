import { X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tenantService } from '../../services/tenantService';
import { CreateTenantSchema, type CreateTenantFormValues } from './schemas';
import { FormField, FormInput, FormTextarea } from '../../components/forms';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateTenantModal({ isOpen, onClose, onSuccess }: Props) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError
    } = useForm<CreateTenantFormValues>({
        resolver: zodResolver(CreateTenantSchema),
        defaultValues: {
            name: '',
            description: ''
        }
    });

    if (!isOpen) return null;

    const onSubmit = async (data: CreateTenantFormValues) => {
        try {
            await tenantService.createTenant({
                name: data.name,
                description: data.description || ''
            });
            onSuccess();
            reset();
            onClose();
        } catch (err: any) {
            setError('root', {
                message: err.response?.data?.message || 'Failed to create tenant'
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
                    <h2 className="text-xl font-semibold text-text-primary">Create Tenant</h2>
                    <button onClick={handleClose} className="text-text-secondary hover:text-text-primary" aria-label="Close modal">
                        <X size={24} />
                    </button>
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
                                label="Tenant Name"
                                error={errors.name?.message}
                                required
                                htmlFor="tenant-name"
                            >
                                <FormInput
                                    {...field}
                                    id="tenant-name"
                                    type="text"
                                    error={!!errors.name}
                                    placeholder="e.g., Acme Corp"
                                />
                            </FormField>
                        )}
                    />

                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <FormField
                                label="Description"
                                error={errors.description?.message}
                                htmlFor="tenant-description"
                            >
                                <FormTextarea
                                    {...field}
                                    id="tenant-description"
                                    rows={3}
                                    error={!!errors.description}
                                    placeholder="Optional description..."
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
                            {isSubmitting ? 'Creating...' : 'Create Tenant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
