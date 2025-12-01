import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateConnectorSchema, type CreateConnectorFormValues } from '../schemas';
import type { Connector } from '../../../types/connector';

interface EditConnectorModalProps {
    isOpen: boolean;
    connector: Connector;
    onClose: () => void;
    onSubmit: (id: string, data: Omit<Connector, 'id' | 'status' | 'createdAt'>) => void;
}

export const EditConnectorModal: React.FC<EditConnectorModalProps> = ({
    isOpen,
    connector,
    onClose,
    onSubmit
}) => {
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<CreateConnectorFormValues>({
        resolver: zodResolver(CreateConnectorSchema),
        defaultValues: {
            name: connector.name,
            type: connector.type,
            config: connector.config || {}
        }
    });

    const selectedType = watch('type');

    if (!isOpen) return null;

    const onFormSubmit = (data: CreateConnectorFormValues) => {
        onSubmit(connector.id, {
            name: data.name,
            type: data.type,
            config: data.config
        });
        setTestResult(null);
        onClose();
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const success = Math.random() > 0.3;
        setTestResult({
            success,
            message: success ? 'Connection successful!' : 'Failed to connect: Connection timed out.'
        });
        setIsTesting(false);
    };

    const handleCancel = () => {
        reset();
        setTestResult(null);
        onClose();
    };

    // Check if there are any errors
    const hasErrors = Object.keys(errors).length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-xl border border-surface-border-subtle bg-surface p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <h2 className="mb-6 text-xl font-bold text-white">Edit Connector</h2>

                {/* Error Summary */}
                {hasErrors && (
                    <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3">
                        <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-lg text-red-400">error</span>
                            <div>
                                <p className="text-sm font-medium text-red-400">Please fix the following errors:</p>
                                <ul className="mt-1 list-inside list-disc text-xs text-red-300">
                                    {errors.name && <li>{errors.name.message}</li>}
                                    {errors.config?.host && <li>Host: {errors.config.host.message as string}</li>}
                                    {errors.config?.port && <li>Port: {errors.config.port.message as string}</li>}
                                    {errors.config?.databaseName && <li>Database Name: {errors.config.databaseName.message as string}</li>}
                                    {errors.config?.username && <li>Username: {errors.config.username.message as string}</li>}
                                    {errors.config?.password && <li>Password: {errors.config.password.message as string}</li>}
                                    {errors.config?.endpoint && <li>Endpoint: {errors.config.endpoint.message as string}</li>}
                                    {errors.config?.path && <li>Path: {errors.config.path.message as string}</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-6">
                    {/* Name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-tertiary">Name</label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    className={`rounded-lg border bg-surface-elevated/50 px-3 py-2 text-white focus:outline-none ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-surface-border focus:border-primary'}`}
                                    placeholder="e.g., Production DB"
                                />
                            )}
                        />
                        {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                    </div>

                    {/* Type */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-tertiary">Type</label>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <select
                                    {...field}
                                    className="rounded-lg border border-surface-border bg-surface-elevated/50 px-3 py-2 text-white focus:border-primary focus:outline-none"
                                >
                                    <option value="DATABASE">Database</option>
                                    <option value="API">API</option>
                                    <option value="FILE_SYSTEM">File System</option>
                                </select>
                            )}
                        />
                    </div>

                    {/* Dynamic Config Fields */}
                    <div className="rounded-lg border border-surface-border/50 bg-surface/30 p-4">
                        <h3 className="mb-4 text-sm font-semibold text-text-secondary">Configuration</h3>

                        {selectedType === 'DATABASE' && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-medium text-text-tertiary">Host</label>
                                    <Controller
                                        name="config.host"
                                        control={control}
                                        render={({ field }) => (
                                            <input {...field} value={field.value as string || ''} className={`rounded-lg border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:outline-none ${errors.config?.host ? 'border-red-500' : 'border-surface-border focus:border-primary'}`} />
                                        )}
                                    />
                                    {errors.config?.host && <span className="text-xs text-red-500">{errors.config.host.message as string}</span>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-medium text-text-tertiary">Port</label>
                                    <Controller
                                        name="config.port"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="number"
                                                {...field}
                                                value={field.value as number || ''}
                                                onChange={e => field.onChange(parseInt(e.target.value))}
                                                className={`rounded-lg border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:outline-none ${errors.config?.port ? 'border-red-500' : 'border-surface-border focus:border-primary'}`}
                                            />
                                        )}
                                    />
                                    {errors.config?.port && <span className="text-xs text-red-500">{errors.config.port.message as string}</span>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-medium text-text-tertiary">Database Name</label>
                                    <Controller
                                        name="config.databaseName"
                                        control={control}
                                        render={({ field }) => (
                                            <input {...field} value={field.value as string || ''} className={`rounded-lg border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:outline-none ${errors.config?.databaseName ? 'border-red-500' : 'border-surface-border focus:border-primary'}`} />
                                        )}
                                    />
                                    {errors.config?.databaseName && <span className="text-xs text-red-500">{errors.config.databaseName.message as string}</span>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-medium text-text-tertiary">Username</label>
                                    <Controller
                                        name="config.username"
                                        control={control}
                                        render={({ field }) => (
                                            <input {...field} value={field.value as string || ''} className={`rounded-lg border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:outline-none ${errors.config?.username ? 'border-red-500' : 'border-surface-border focus:border-primary'}`} />
                                        )}
                                    />
                                    {errors.config?.username && <span className="text-xs text-red-500">{errors.config.username.message as string}</span>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-medium text-text-tertiary">Password</label>
                                    <Controller
                                        name="config.password"
                                        control={control}
                                        render={({ field }) => (
                                            <input type="password" {...field} value={field.value as string || ''} className={`rounded-lg border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:outline-none ${errors.config?.password ? 'border-red-500' : 'border-surface-border focus:border-primary'}`} />
                                        )}
                                    />
                                    {errors.config?.password && <span className="text-xs text-red-500">{errors.config.password.message as string}</span>}
                                </div>
                            </div>
                        )}

                        {selectedType === 'API' && (
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-medium text-text-tertiary">Endpoint URL</label>
                                    <Controller
                                        name="config.endpoint"
                                        control={control}
                                        render={({ field }) => (
                                            <input {...field} value={field.value as string || ''} className={`rounded-lg border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:outline-none ${errors.config?.endpoint ? 'border-red-500' : 'border-surface-border focus:border-primary'}`} placeholder="https://api.example.com" />
                                        )}
                                    />
                                    {errors.config?.endpoint && <span className="text-xs text-red-500">{errors.config.endpoint.message as string}</span>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-medium text-text-tertiary">Auth Type</label>
                                    <Controller
                                        name="config.authType"
                                        control={control}
                                        render={({ field }) => (
                                            <select {...field} value={field.value as string || 'NONE'} className="rounded-lg border border-surface-border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none">
                                                <option value="NONE">None</option>
                                                <option value="BASIC">Basic Auth</option>
                                                <option value="BEARER">Bearer Token</option>
                                                <option value="API_KEY">API Key</option>
                                            </select>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {selectedType === 'FILE_SYSTEM' && (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-text-tertiary">File Path</label>
                                <Controller
                                    name="config.path"
                                    control={control}
                                    render={({ field }) => (
                                        <input {...field} value={field.value as string || ''} className={`rounded-lg border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:outline-none ${errors.config?.path ? 'border-red-500' : 'border-surface-border focus:border-primary'}`} placeholder="/var/data/files" />
                                    )}
                                />
                                {errors.config?.path && <span className="text-xs text-red-500">{errors.config.path.message as string}</span>}
                            </div>
                        )}
                    </div>

                    {/* Test Result Message */}
                    {testResult && (
                        <div className={`rounded-lg p-3 text-sm ${testResult.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">
                                    {testResult.success ? 'check_circle' : 'error'}
                                </span>
                                {testResult.message}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex justify-between gap-3">
                        <button
                            type="button"
                            onClick={handleTestConnection}
                            disabled={isTesting}
                            className="flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated disabled:opacity-50"
                        >
                            {isTesting ? (
                                <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                            ) : (
                                <span className="material-symbols-outlined text-lg">wifi</span>
                            )}
                            Test Connection
                        </button>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-text-tertiary hover:bg-surface-elevated hover:text-text-primary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !isDirty}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
