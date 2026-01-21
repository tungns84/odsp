import { apiClient } from './api';
import type { WorkflowTask, StartProcessResponse } from '../types/workflowTypes';

interface TaskFilters {
    group?: string;
    assignee?: string;
    processKey?: string;
}

class WorkflowService {
    /**
     * Start a workflow process by its definition key.
     * @param processKey BPMN process definition key (e.g., "endpoint-publishing")
     * @param variables Process variables to initialize the workflow
     */
    async startProcess(
        processKey: string,
        variables: Record<string, unknown>
    ): Promise<StartProcessResponse> {
        const { data } = await apiClient.post<StartProcessResponse>(
            `/api/workflow/process-instance/${processKey}`,
            variables
        );
        return data;
    }

    /**
     * Get all pending tasks, optionally filtered.
     */
    async getTasks(filters?: TaskFilters): Promise<WorkflowTask[]> {
        const params = new URLSearchParams();
        if (filters?.group) params.append('group', filters.group);

        const { data } = await apiClient.get<WorkflowTask[]>(
            `/api/workflow/tasks?${params.toString()}`
        );
        return data;
    }

    /**
     * Complete a task.
     */
    async completeTask(taskId: string): Promise<void> {
        await apiClient.post(`/api/workflow/tasks/${taskId}/complete`);
    }
}

export const workflowService = new WorkflowService();
