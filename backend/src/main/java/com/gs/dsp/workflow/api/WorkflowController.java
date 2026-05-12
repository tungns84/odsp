package com.gs.dsp.workflow.api;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.flowable.engine.runtime.ProcessInstance;
import org.flowable.task.api.Task;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workflow")
@RequiredArgsConstructor
@Slf4j
public class WorkflowController {

    private final RuntimeService runtimeService;
    private final TaskService taskService;

    /**
     * Start a workflow process by its definition key.
     * @param processKey The BPMN process definition key (e.g., "endpoint-publishing")
     * @param variables Process variables to initialize the workflow
     */
    @PostMapping("/process-instance/{processKey}")
    public ResponseEntity<Map<String, String>> startProcess(
            @PathVariable String processKey,
            @RequestBody Map<String, Object> variables) {
        log.info("Starting process '{}' with variables: {}", processKey, variables.keySet());

        ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(processKey, variables);

        return ResponseEntity.ok(Map.of(
            "processInstanceId", processInstance.getId(),
            "status", "STARTED"
        ));
    }

    /**
     * List all pending tasks for a specific candidate group.
     */
    @GetMapping("/tasks")
    public List<TaskResponse> getTasks(@RequestParam(required = false, defaultValue = "admin") String group) {
        List<Task> tasks = taskService.createTaskQuery()
                .taskCandidateGroup(group)
                .list();

        return tasks.stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    /**
     * Complete a task.
     */
    @PostMapping("/tasks/{taskId}/complete")
    public ResponseEntity<Void> completeTask(
            @PathVariable String taskId,
            @RequestBody(required = false) Map<String, Object> variables) {
        log.info("Completing task: {} with variables: {}", taskId, variables);
        if (variables != null && !variables.isEmpty()) {
            taskService.complete(taskId, variables);
        } else {
            taskService.complete(taskId);
        }
        return ResponseEntity.ok().build();
    }

    @Data
    public static class TaskResponse {
        private String id;
        private String name;
        private String assignee;
        private String processInstanceId;
        private String processDefinitionKey;
        private Map<String, Object> variables;
        private String createTime;
    }

    private TaskResponse mapToTaskResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setName(task.getName());
        response.setAssignee(task.getAssignee());
        response.setProcessInstanceId(task.getProcessInstanceId());
        response.setProcessDefinitionKey(task.getProcessDefinitionId().split(":")[0]);
        response.setCreateTime(task.getCreateTime() != null ? task.getCreateTime().toString() : null);
        
        Map<String, Object> variables = runtimeService.getVariables(task.getExecutionId());
        response.setVariables(variables);
        return response;
    }
}
