package com.gs.dsp.workflow;

import com.gs.dsp.dataaccess.application.service.DataEndpointApplicationService;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.flowable.engine.runtime.ProcessInstance;
import org.flowable.task.api.Task;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@SpringBootTest
public class FlowableIntegrationTest {

    @Autowired
    private RuntimeService runtimeService;

    @Autowired
    private TaskService taskService;

    @MockBean
    private DataEndpointApplicationService dataEndpointApplicationService;

    @Test
    public void testEndpointPublishingWorkflow() {
        // Arrange
        String endpointId = UUID.randomUUID().toString();
        String tenantId = "tenant-1";
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("endpointId", endpointId);
        variables.put("tenantId", tenantId);

        // Act 1: Start Process
        ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("endpoint-publishing", variables);
        assertThat(processInstance).isNotNull();
        System.out.println("Process started: " + processInstance.getId());

        // Assert 1: User Task Created
        Task task = taskService.createTaskQuery()
                .processInstanceId(processInstance.getId())
                .taskCandidateGroup("admin")
                .singleResult();
        
        assertThat(task).isNotNull();
        assertThat(task.getName()).isEqualTo("Approve Publication");

        // Act 2: Complete User Task (Approve)
        taskService.complete(task.getId());

        // Assert 2: Process Finished and Service Called
        // Verify that the delegate called the application service
        verify(dataEndpointApplicationService).activateEndpoint(eq(endpointId), eq(tenantId));
        
        // Verify process is finished
        long count = runtimeService.createProcessInstanceQuery()
                .processInstanceId(processInstance.getId())
                .count();
        assertThat(count).isEqualTo(0);
    }
}
