import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { WizardStep1Schema, type WizardStep1FormValues } from '../schemas';
import { connectorService } from '../../../services';
import type { TableMetadata } from '../../../types/connector';

interface WizardStep1Props {
    initialValues: Partial<WizardStep1FormValues>;
    onNext: (values: WizardStep1FormValues, tables: TableMetadata[]) => void;
    onCancel: () => void;
}

export const WizardStep1ConnectionDetails: React.FC<WizardStep1Props> = ({
    initialValues,
    onNext,
    onCancel
}) => {
    const [isTesting, setIsTesting] = useState(false);
    const [testError, setTestError] = useState<string | null>(null);
    const [testSuccess, setTestSuccess] = useState(false);
    const [fetchedTables, setFetchedTables] = useState<TableMetadata[]>([]);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<WizardStep1FormValues>({
        resolver: zodResolver(WizardStep1Schema),
        defaultValues: {
            name: initialValues.name || '',
            type: initialValues.type || 'DATABASE',
            config: initialValues.config || {}
        }
    });

    const selectedType = watch('type');

    const handleTestConnection = async (data: WizardStep1FormValues) => {
        setIsTesting(true);
        setTestError(null);
        setTestSuccess(false);
        try {
            const response = await connectorService.testConnectionAndFetchTables(data.config);
            setFetchedTables(response.data);
            setTestSuccess(true);
        } catch (err: any) {
            console.error('Connection test failed:', err);
            // Parse backend error response
            const errorMessage = err.response?.data?.message
                || err.response?.data?.error
                || (err.response?.status === 500 ? 'Server error. Please check database configuration.' : '')
                || (err.response?.status === 400 ? 'Invalid configuration. Please check your inputs.' : '')
                || 'Failed to connect. Please check your credentials.';
            setTestError(errorMessage);
        } finally {
            setIsTesting(false);
        }
    };

    const onSubmit = (data: WizardStep1FormValues) => {
        if (testSuccess) {
            onNext(data, fetchedTables);
        } else {
            // Trigger test if not already successful
            handleTestConnection(data);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
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
                            onChange={(e) => {
                                field.onChange(e);
                                setTestSuccess(false);
                                setFetchedTables([]);
                            }}
                        >
                            <option value="DATABASE">Database</option>
                            <option value="API">API</option>
                            <option value="FILE_SYSTEM">File System</option>
                        </select>
                    )}
                />
            </div>

            {/* Dynamic Config Fields */}
            <div className="rounded-lg border border-surface-border/50 bg-surface/30 p-4 relative">
                <h3 className="mb-4 text-sm font-semibold text-text-secondary">Configuration</h3>

                {/* Loading Overlay */}
                {isTesting && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/80 backdrop-blur-sm rounded-lg">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                            <p className="text-sm text-text-secondary font-medium">Testing connection...</p>
                        </div>
                    </div>
                )}

                {selectedType === 'DATABASE' && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-text-tertiary">Host</label>
                            <Controller
                                name="config.host"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} value={field.value as string || ''} className={`rounded-lg border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:outline-none ${errors.config?.host ? 'border-red-500' : 'border-surface-border focus:border-primary'}`} onChange={(e) => { field.onChange(e); setTestSuccess(false); }} />
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
                                        onChange={e => { field.onChange(parseInt(e.target.value)); setTestSuccess(false); }}
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
                                    <input {...field} value={field.value as string || ''} className={`rounded-lg border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:outline-none ${errors.config?.databaseName ? 'border-red-500' : 'border-surface-border focus:border-primary'}`} onChange={(e) => { field.onChange(e); setTestSuccess(false); }} />
                                )}
                            />
                            {errors.config?.databaseName && <span className="text-xs text-red-500">{errors.config.databaseName.message as string}</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-text-tertiary">Schema</label>
                            <Controller
                                name="config.schema"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        value={field.value as string || 'public'}
                                        placeholder="public"
                                        className={`rounded-lg border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:outline-none ${errors.config?.schema ? 'border-red-500' : 'border-surface-border focus:border-primary'}`}
                                        onChange={(e) => { field.onChange(e); setTestSuccess(false); }}
                                    />
                                )}
                            />
                            {errors.config?.schema && <span className="text-xs text-red-500">{errors.config.schema.message as string}</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-text-tertiary">Username</label>
                            <Controller
                                name="config.username"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} value={field.value as string || ''} className={`rounded-lg border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:outline-none ${errors.config?.username ? 'border-red-500' : 'border-surface-border focus:border-primary'}`} onChange={(e) => { field.onChange(e); setTestSuccess(false); }} />
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
                                    <input type="password" {...field} value={field.value as string || ''} className={`rounded-lg border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:outline-none ${errors.config?.password ? 'border-red-500' : 'border-surface-border focus:border-primary'}`} onChange={(e) => { field.onChange(e); setTestSuccess(false); }} />
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
                                    <input {...field} value={field.value as string || ''} className={`rounded-lg border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:outline-none ${errors.config?.endpoint ? 'border-red-500' : 'border-surface-border focus:border-primary'}`} placeholder="https://api.example.com" onChange={(e) => { field.onChange(e); setTestSuccess(false); }} />
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
                                    <select {...field} value={field.value as string || 'NONE'} className="rounded-lg border border-surface-border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" onChange={(e) => { field.onChange(e); setTestSuccess(false); }}>
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
                                <input {...field} value={field.value as string || ''} className={`rounded-lg border bg-surface-elevated/50 px-3 py-2 text-sm text-white focus:outline-none ${errors.config?.path ? 'border-red-500' : 'border-surface-border focus:border-primary'}`} placeholder="/var/data/files" onChange={(e) => { field.onChange(e); setTestSuccess(false); }} />
                            )}
                        />
                        {errors.config?.path && <span className="text-xs text-red-500">{errors.config.path.message as string}</span>}
                    </div>
                )}
            </div>

            {/* Test Status */}
            {testError && (
                <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">error</span>
                        {testError}
                    </div>
                </div>
            )}
            {testSuccess && (
                <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        Connection successful! {fetchedTables.length} tables found.
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between gap-3">
                <button
                    type="button"
                    onClick={handleSubmit(handleTestConnection)}
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
                        onClick={onCancel}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-text-tertiary hover:bg-surface-elevated hover:text-text-primary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!testSuccess || isTesting}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </form>
    );
};
