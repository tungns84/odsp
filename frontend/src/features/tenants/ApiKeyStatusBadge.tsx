import React from 'react';
import type { ApiKeyStatus } from '../../types/apiKeyTypes';

interface Props {
    status: ApiKeyStatus;
}

export function ApiKeyStatusBadge({ status }: Props) {
    const getColors = () => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'REVOKED':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'EXPIRED':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColors()}`}>
            {status}
        </span>
    );
}
