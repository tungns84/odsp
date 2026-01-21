export interface WorkflowTask {
    id: string;
    name: string;
    processDefinitionKey: string;
    processInstanceId: string;
    variables: Record<string, unknown>;
    assignee: string | null;
    createTime: string | null;
}

export interface ProcessInstance {
    id: string;
    processDefinitionKey: string;
    businessKey?: string;
    startTime: string;
    startUserId?: string;
}

export interface StartProcessResponse {
    processInstanceId: string;
    status: string;
}

export interface CurrentUser {
    id: string;
    username: string;
    role: 'ADMIN' | 'USER';
}
