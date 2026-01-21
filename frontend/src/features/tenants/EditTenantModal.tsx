import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tenantService } from '../../services/tenantService';
import type { Tenant } from '../../types/tenantTypes';
import { EditTenantSchema, type EditTenantFormValues } from './schemas';
import { FormField, FormInput, FormTextarea } from '../../components/forms';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    tenant: Tenant | null;
}

export function EditTenantModal({ isOpen, onClose, onSuccess, tenant }: Props) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setError
    } = useForm<EditTenantFormValues>({
        resolver: zodResolver(EditTenantSchema),
        defaultValues: {
            name: '',
            description: '',
            isActive: true
        }
    });

    useEffect(() => {
        if (tenant) {
            reset({
                name: tenant.name,
                description: tenant.description || '',
                isActive: tenant.status === 'ACTIVE'
            });
        }
    }, [tenant, reset]);

    if (!isOpen || !tenant) return null;

    const onSubmit = async (data: EditTenantFormValues) => {
        try {
            await tenantService.updateTenant(tenant.id, {
                name: data.name,
                description: data.description || '',
                status: data.isActive ? 'ACTIVE' : 'INACTIVE'
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError('root', {
                message: err.response?.data?.message || 'Failed to update tenant'
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg border border-surface-border bg-surface p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text-primary">Edit Tenant</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
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
                                htmlFor="edit-tenant-name"
                            >
                                <FormInput
                                    {...field}
                                    id="edit-tenant-name"
                                    type="text"
                                    error={!!errors.name}
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
                                htmlFor="edit-tenant-description"
                            >
                                <FormTextarea
                                    {...field}
                                    id="edit-tenant-description"
                                    rows={3}
                                    error={!!errors.description}
                                />
                            </FormField>
                        )}
                    />

                    <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="edit-tenant-active"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="rounded border-surface-border text-primary focus:ring-focus-ring"
                                />
                                <label htmlFor="edit-tenant-active" className="text-sm font-medium text-text-secondary">
                                    Active
                                </label>
                            </div>
                        )}
                    />

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-surface-border text-text-secondary hover:bg-surface-elevated transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
