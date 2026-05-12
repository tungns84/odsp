# Workflow Core Architecture & Guide

> **Purpose**: This guide explains the Generic Workflow Solution implemented in the LDOP Demo project. It serves as a reference for developers and AI agents implementing new workflow-based features (Core Flow Cases).

## 1. Architecture Overview

 The workflow engine is built on **Flowable** (integrated via `flowable-spring-boot-starter`). It follows a Clean Architecture approach where the "Workflow" is treated as a distinct infrastructure component that orchestrates business logic across Bounded Contexts.

### Key Components

| Component | Responsibility | Location |
|-----------|----------------|----------|
| **Workflow API** | Generic REST endpoints for starting processes and managing tasks. | `com.gs.dsp.workflow.api.WorkflowController` |
| **BPMN Definitions** | Process definitions (XML) describing the flow logic. | `backend/src/main/resources/processes/*.bpmn20.xml` |
| **Java Delegates** | Executable code triggered by Service Tasks in BPMN. | `com.gs.dsp.workflow.delegate.*` |
| **Frontend Service** | Client-side wrapper for Workflow API. | `frontend/src/services/workflowService.ts` |

---

## 2. Generic API usage

The system provides **generic endpoints** that work for ANY process definition. You do NOT need to create new Controllers for new flows.

### 2.1 Start a Process
Starts a new process instance by its key (defined in BPMN). You can pass arbitrary variables map.

**Endpoint:** `POST /api/workflow/process-instance/{processKey}`
**Body:** `{ "var1": "value", "var2": 123 }`

```typescript
// Frontend Example
await workflowService.startProcess('endpoint-publishing', {
    endpointId: '123',
    tenantId: 'tenant-1'
});
```

### 2.2 List Tasks
Lists pending user tasks, filtered by candidate group.

**Endpoint:** `GET /api/workflow/tasks?group=admin`

```typescript
// Frontend Example
const tasks = await workflowService.getTasks({ group: 'admin' });
```

### 2.3 Complete a Task
Completes a user task and optionally passes variables (e.g., for decision gateways).

**Endpoint:** `POST /api/workflow/tasks/{taskId}/complete`
**Body:** `{ "approved": true, "reason": "Looks good" }`

```typescript
// Frontend Example
await workflowService.completeTask(taskId, {
    approved: true
});
```

---

## 3. How to Implement a New Core Flow

Follow these steps to add a new business workflow (e.g., "Access Request").

### Step 1: Define the Process (BPMN)
Create a new file in `backend/src/main/resources/processes/access-request.bpmn20.xml`.

```xml
<process id="access-request" name="Access Request" isExecutable="true">
    <startEvent id="start" />
    <sequenceFlow sourceRef="start" targetRef="reviewTask" />
    
    <userTask id="reviewTask" name="Manager Review" flowable:candidateGroups="manager" />
    
    <sequenceFlow sourceRef="reviewTask" targetRef="decision" />
    
    <exclusiveGateway id="decision" />
    <sequenceFlow sourceRef="decision" targetRef="grantAccess">
        <conditionExpression xsi:type="tFormalExpression">${approved == true}</conditionExpression>
    </sequenceFlow>
    <sequenceFlow sourceRef="decision" targetRef="rejectRequest">
        <conditionExpression xsi:type="tFormalExpression">${approved == false}</conditionExpression>
    </sequenceFlow>
    
    <serviceTask id="grantAccess" flowable:delegateExpression="${grantAccessDelegate}" />
    <!-- ... end events ... -->
</process>
```

### Step 2: Implement Java Delegate (Optional)
If your flow needs to execute backend logic (Service Task), create a generic Delegate.

**Rules:**
1. Implement `org.flowable.engine.delegate.JavaDelegate`.
2. Annotate with `@Component("beanName")`.
3. Use `delegateExecution.getVariable()` to get context.
4. Call Application Services for business logic.

```java
@Component("grantAccessDelegate")
@RequiredArgsConstructor
public class GrantAccessDelegate implements JavaDelegate {
    private final AccessControlApplicationService accessService;

    @Override
    public void execute(DelegateExecution execution) {
        String userId = (String) execution.getVariable("userId");
        accessService.grantAccess(userId);
    }
}
```

### Step 3: Frontend Integration
1. **Start Flow:** Call `workflowService.startProcess('access-request', { userId: '...' })` from your UI.
2. **Task Box:** The `EndpointTaskInbox` (or a specific inbox) will automatically show the new tasks if the logged-in user belongs to the `candidateGroup` ("manager").
3. **Complete Task:** When the manager clicks "Approve", call `workflowService.completeTask(taskId, { approved: true })`.

---

## 4. Best Practices for Agents

1.  **Reusability**: Do not Modify `WorkflowController` for specific flows. It is designed to be generic.
2.  **Delegates**: Keep Delegates thin. They should only extract variables and call the Domain/Application Layer. Do not put business logic in Delegates.
3.  **Variables**: Be consistent with variable names (e.g., `tenantId`, `userId`, `resourceId`) across flows.
4.  **Error Handling**: If a Delegate throws an exception, the Generic Exception Handler will catch it? **Note**: Flowable handles exceptions differently (retries/dead letter). Ensure Delegates handle expected business errors gracefully.

