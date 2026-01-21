import { apiClient } from './api';
import type { CurrentUser } from '../types/workflowTypes';

class AuthService {
    /**
     * Get current user info.
     * Phase 1: Returns hardcoded ADMIN from backend.
     */
    async getCurrentUser(): Promise<CurrentUser> {
        const { data } = await apiClient.get<CurrentUser>('/api/me');
        return data;
    }
}

export const authService = new AuthService();
