import { useState, useEffect, useCallback } from 'react';
import { dataEndpointService } from '../services';
import type { DataEndpoint } from '../types/dataEndpointTypes';

export const useDataEndpoints = () => {
    const [endpoints, setEndpoints] = useState<DataEndpoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadEndpoints = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await dataEndpointService.getAll();
            setEndpoints(response.data);
        } catch (err: any) {
            console.error('Failed to load endpoints:', err);
            setError(err.response?.data?.message || 'Failed to load endpoints. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEndpoints();
    }, [loadEndpoints]);

    const deleteEndpoint = async (id: string) => {
        try {
            await dataEndpointService.delete(id);
            setEndpoints(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            console.error('Failed to delete endpoint:', err);
            throw err;
        }
    };

    const toggleStatus = async (id: string) => {
        const endpoint = endpoints.find(e => e.id === id);
        if (!endpoint) return;

        const newStatus = endpoint.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        try {
            await dataEndpointService.toggleStatus(id, newStatus);
            setEndpoints(prev => prev.map(e =>
                e.id === id ? { ...e, status: newStatus } : e
            ));
        } catch (err) {
            console.error('Failed to toggle status:', err);
            throw err;
        }
    };

    return {
        endpoints,
        loading,
        error,
        refresh: loadEndpoints,
        deleteEndpoint,
        toggleStatus
    };
};
