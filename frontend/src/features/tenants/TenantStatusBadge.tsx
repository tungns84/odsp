import React from 'react';
import type { TenantStatus } from '../../types/tenantTypes';

interface Props {
    status: TenantStatus;
}

export function TenantStatusBadge({ status }: Props) {
    const isActive = status === 'ACTIVE';

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-green-500' : 'bg-gray-500'
                }`}></span>
            {status}
        </span>
    );
}
