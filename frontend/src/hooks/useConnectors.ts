import { useState, useEffect, useCallback } from 'react';
import { connectorService } from '../services';
import type { Connector } from '../types/connectorTypes';

export const useConnectors = () => {
    const [connectors, setConnectors] = useState<Connector[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadConnectors = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await connectorService.getAll();
            setConnectors(response.data);
        } catch (err) {
            console.error('Failed to load connectors:', err);
            setError('Failed to load connectors. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConnectors();
    }, [loadConnectors]);

    // Stable mutation functions using useCallback
    const createConnector = useCallback(async (data: Omit<Connector, 'id' | 'status' | 'createdAt' | 'tenantId'>) => {
        try {
            const response = await connectorService.create(data);
            setConnectors(prev => [response.data, ...prev]);
            return response.data;
        } catch (err) {
            console.error('Failed to create connector:', err);
            throw err;
        }
    }, []);

    const updateConnector = useCallback(async (id: string, data: Partial<Connector>) => {
        try {
            const response = await connectorService.update(id, data);
            setConnectors(prev => prev.map(c => c.id === id ? response.data : c));
            return response.data;
        } catch (err) {
            console.error('Failed to update connector:', err);
            throw err;
        }
    }, []);

    const deleteConnector = useCallback(async (id: string) => {
        try {
            await connectorService.delete(id);
            setConnectors(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Failed to delete connector:', err);
            throw err;
        }
    }, []);

    const approveConnector = useCallback(async (id: string) => {
        try {
            const response = await connectorService.updateApprovalStatus(id, 'APPROVED');
            setConnectors(prev => prev.map(c => c.id === id ? response.data : c));
            return response.data;
        } catch (err) {
            console.error('Failed to approve connector:', err);
            throw err;
        }
    }, []);

    const rejectConnector = useCallback(async (id: string) => {
        try {
            const response = await connectorService.updateApprovalStatus(id, 'REJECTED');
            setConnectors(prev => prev.map(c => c.id === id ? response.data : c));
            return response.data;
        } catch (err) {
            console.error('Failed to reject connector:', err);
            throw err;
        }
    }, []);

    return {
        connectors,
        loading,
        error,
        refresh: loadConnectors,
        createConnector,
        updateConnector,
        deleteConnector,
        approveConnector,
        rejectConnector
    };
};
