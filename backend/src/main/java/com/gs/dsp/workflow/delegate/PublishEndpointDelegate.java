package com.gs.dsp.workflow.delegate;

import com.gs.dsp.dataaccess.application.service.DataEndpointApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

/**
 * Service Task Delegate to publish a Data Endpoint.
 * This is called by the Flowable Engine when the "Publish Endpoint" service task is executed.
 */
@Component("publishEndpointDelegate")
@RequiredArgsConstructor
@Slf4j
public class PublishEndpointDelegate implements JavaDelegate {

    private final DataEndpointApplicationService dataEndpointApplicationService;

    @Override
    public void execute(DelegateExecution execution) {
        String endpointId = (String) execution.getVariable("endpointId");
        String tenantId = (String) execution.getVariable("tenantId");
        
        log.info("Executing PublishEndpointDelegate for endpoint: {} in tenant: {}", endpointId, tenantId);
        
        try {
            dataEndpointApplicationService.activateEndpoint(endpointId, tenantId);
            log.info("Endpoint {} published successfully.", endpointId);
        } catch (Exception e) {
            log.error("Failed to publish endpoint {}", endpointId, e);
            throw new RuntimeException("Failed to publish endpoint: " + e.getMessage(), e);
        }
    }
}
