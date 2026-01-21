import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { workflowService } from '../services/workflowService';
import type { WorkflowTask } from '../types/workflowTypes';

const POLLING_INTERVAL_MS = 30000; // 30 seconds

interface UseWorkflowTasksOptions {
    group?: string;
    processKey?: string;
}

/**
 * Hook for managing workflow tasks with SWR polling.
 * Uses client-swr-dedup pattern from Vercel best practices.
 */
export function useWorkflowTasks(options: UseWorkflowTasksOptions = {}) {
    const { group = 'admin', processKey } = options;

    const { data, error, mutate, isLoading } = useSWR<WorkflowTask[]>(
        ['workflow-tasks', group],
        () => workflowService.getTasks({ group }),
        {
            refreshInterval: POLLING_INTERVAL_MS,
            revalidateOnFocus: true,
            dedupingInterval: 5000,
        }
    );

    // Memoize filtered tasks to avoid recalculation on each render
    const tasks = useMemo(() => {
        if (!data) return [];
        return processKey
            ? data.filter(t => t.processDefinitionKey === processKey)
            : data;
    }, [data, processKey]);

    const completeTask = useCallback(async (taskId: string) => {
        await workflowService.completeTask(taskId);
        mutate(); // Trigger revalidation
    }, [mutate]);

    const refresh = useCallback(() => {
        mutate();
    }, [mutate]);

    return {
        tasks,
        loading: isLoading,
        error: error ? 'Failed to fetch tasks' : null,
        completeTask,
        refresh,
    };
}
