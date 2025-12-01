import { Key, CheckCircle, XCircle } from 'lucide-react';
import type { ApiKey } from '../../types/apiKeyTypes';

interface Props {
    apiKeys: ApiKey[];
}

export function ApiKeyStatsCards({ apiKeys }: Props) {
    const stats = {
        total: apiKeys.length,
        active: apiKeys.filter((k) => k.status === 'ACTIVE').length,
        revoked: apiKeys.filter((k) => k.status === 'REVOKED').length,
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-surface border border-surface-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-text-secondary text-sm">Total Keys</p>
                        <p className="text-2xl font-bold text-text-primary mt-1">{stats.total}</p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Key className="text-primary" size={20} />
                    </div>
                </div>
            </div>

            <div className="bg-surface border border-surface-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-text-secondary text-sm">Active</p>
                        <p className="text-2xl font-bold text-green-500 mt-1">{stats.active}</p>
                    </div>
                    <div className="p-2 bg-green-500/10 rounded-lg">
                        <CheckCircle className="text-green-500" size={20} />
                    </div>
                </div>
            </div>

            <div className="bg-surface border border-surface-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-text-secondary text-sm">Revoked</p>
                        <p className="text-2xl font-bold text-red-500 mt-1">{stats.revoked}</p>
                    </div>
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <XCircle className="text-red-500" size={20} />
                    </div>
                </div>
            </div>
        </div>
    );
}
