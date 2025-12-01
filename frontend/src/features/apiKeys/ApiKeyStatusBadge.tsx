import type { ApiKeyStatus } from '../../types/apiKeyTypes';

interface Props {
    status: ApiKeyStatus;
}

export function ApiKeyStatusBadge({ status }: Props) {
    const styles = {
        ACTIVE: 'bg-green-500/10 text-green-500 border-green-500/20',
        REVOKED: 'bg-red-500/10 text-red-500 border-red-500/20',
        EXPIRED: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
            {status}
        </span>
    );
}
