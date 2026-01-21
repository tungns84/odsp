import useSWR from 'swr';
import { authService } from '../services/authService';
import type { CurrentUser } from '../types/workflowTypes';

/**
 * Hook for fetching current user info.
 * Phase 1: Returns hardcoded ADMIN from backend.
 */
export function useCurrentUser() {
    const { data, error, isLoading } = useSWR<CurrentUser>(
        'current-user',
        () => authService.getCurrentUser(),
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000, // Cache for 1 minute
        }
    );

    return {
        user: data || null,
        loading: isLoading,
        error: error ? 'Failed to fetch user info' : null,
        isAdmin: data?.role === 'ADMIN',
    };
}
