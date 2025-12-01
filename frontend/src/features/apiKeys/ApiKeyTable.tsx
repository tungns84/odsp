import { Trash2, Ban } from 'lucide-react';
import type { ApiKey } from '../../types/apiKeyTypes';
import { ApiKeyStatusBadge } from './ApiKeyStatusBadge';

interface Props {
    apiKeys: ApiKey[];
    loading: boolean;
    onRevoke: (id: string) => void;
    onDelete: (id: string) => void;
}

export function ApiKeyTable({ apiKeys, loading, onRevoke, onDelete }: Props) {
    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-text-secondary mt-2">Loading API keys...</p>
            </div>
        );
    }

    if (apiKeys.length === 0) {
        return (
            <div className="text-center py-8 bg-surface-elevated/50 rounded-lg border border-dashed border-surface-border">
                <p className="text-text-secondary">No API keys found for this tenant</p>
            </div>
        );
    }

    return (
        <div className="bg-surface border border-surface-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-surface-elevated border-b border-surface-border">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Prefix</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Expires</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                        {apiKeys.map((key) => (
                            <tr key={key.id} className="hover:bg-surface-elevated transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{key.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary font-mono bg-surface-elevated/50 px-2 py-1 rounded w-fit">
                                    {key.prefix}••••••••
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <ApiKeyStatusBadge status={key.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                    {new Date(key.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                    {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : 'Never'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex gap-2">
                                        {key.status === 'ACTIVE' && (
                                            <button
                                                onClick={() => onRevoke(key.id)}
                                                className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-yellow-500"
                                                title="Revoke Key"
                                            >
                                                <Ban size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onDelete(key.id)}
                                            className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-red-500"
                                            title="Delete Key"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
