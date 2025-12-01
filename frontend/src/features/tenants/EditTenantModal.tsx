import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { tenantService } from '../../services/tenantService';
import type { Tenant } from '../../types/tenantTypes';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    tenant: Tenant | null;
}

export function EditTenantModal({ isOpen, onClose, onSuccess, tenant }: Props) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (tenant) {
            setName(tenant.name);
            setDescription(tenant.description || '');
        }
    }, [tenant]);

    if (!isOpen || !tenant) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await tenantService.updateTenant(tenant.id, {
                name,
                description,
                status: tenant.status
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update tenant');
        } finally {
            setLoading(false);
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

                {error && (
                    <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Tenant Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-text-primary focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-text-primary focus:border-primary focus:outline-none"
                        />
                    </div>

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
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Save Changes' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
