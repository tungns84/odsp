package com.gs.dsp.connectivity.application.service;

import com.gs.dsp.connectivity.domain.model.*;
import com.gs.dsp.connectivity.domain.repository.ConnectorRepository;
import com.gs.dsp.connectivity.domain.service.ConnectorMetadataService;
import com.gs.dsp.connectivity.infrastructure.primary.dto.TableMetadata;
import com.gs.dsp.shared.kernel.constants.ErrorMessages;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import io.micrometer.core.annotation.Timed;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.util.StopWatch;
/**
 * Application Service for Connector aggregate.
 * Orchestrates use cases for connector management.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ConnectorApplicationService {
    
    private final ConnectorRepository connectorRepository;
    private final ConnectorMetadataService connectorMetadataService;  // Domain interface

    /**
     * Get all connectors for a tenant.
     */
    public List<Connector> getAllConnectors(String tenantId) {
        return connectorRepository.findByTenantId(tenantId);
    }

    /**
     * Get connector by ID with tenant validation.
     */
    public Optional<Connector> getConnectorById(String id, String tenantId) {
        ConnectorId connectorId = ConnectorId.from(id);
        return connectorRepository.findByIdAndTenantId(connectorId, tenantId);
    }

    /**
     * Create a new connector.
     */
    @Timed(value = "connector.service.create.time", description = "Time taken for createConnector")
    @Transactional
    public Connector createConnector(
            String name,
            String type,
            Map<String, Object> config,
            List<TableMetadata> registeredTables,
            String tenantId) {
        
        log.info("Creating connector: name={}, type={}, tenantId={}, tableCount={}",
            name, type, tenantId, registeredTables != null ? registeredTables.size() : 0);

        ConnectorId id = ConnectorId.generate();
        StopWatch stopWatch = new StopWatch("CreateConnector:" + id.toString());
        stopWatch.start("validate-id:"+id);
        ConnectorType connectorType = new ConnectorType(type);
        ConnectionConfig connectionConfig = new ConnectionConfig(config);
        
        Connector connector = Connector.create(
            id,
            name,
            connectorType,
            connectionConfig,
            tenantId
        );
        stopWatch.stop();
        //log.info("Time 1 connector.service.create.time taken: {} ms ", stopWatch.getTotalTimeMillis());
        stopWatch.start("save_to_db:"+ id);
        // Set registered tables if provided
        if (registeredTables != null && !registeredTables.isEmpty()) {
            connector.updateRegisteredTables(registeredTables);
        }
        
        Connector saved = connectorRepository.save(connector);
        log.info("TX rollbackOnly={}",
                TransactionAspectSupport.currentTransactionStatus().isRollbackOnly());
        log.info("Connector created successfully: id={}, name={}, tenantId={}, status={}",
            saved.getIdValue(), saved.getName(), saved.getTenantId(), saved.getStatus());

        stopWatch.stop();
        //log.info("Time 2 connector.service.create.time taken: {} ms ", stopWatch.getTotalTimeMillis());
        log.info(stopWatch.prettyPrint());
        return saved;
    }

    /**
     * Update connector details.
     */
    @Transactional
    public Connector updateConnector(
            String id,
            String name,
            String type,
            Map<String, Object> config,
            List<TableMetadata> registeredTables,
            boolean isActive,
            String tenantId) {
        
        ConnectorId connectorId = ConnectorId.from(id);
        Connector connector = connectorRepository.findByIdAndTenantId(connectorId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException(
                String.format(ErrorMessages.NOT_FOUND_WITH_ID, "Connector", id)
            ));
        
        ConnectorType connectorType = new ConnectorType(type);
        ConnectionConfig connectionConfig = new ConnectionConfig(config);
        
        // Use domain method
        connector.updateDetails(name, connectorType, connectionConfig, registeredTables);
        
        // Handle active status based on current state
        if (isActive && !connector.isActive()) {
            connector.activate();
        } else if (!isActive && connector.isActive()) {
            connector.deactivate();
        }
        
        return connectorRepository.save(connector);
    }

    /**
     * Approve connector.
     */
    @Transactional
    public Connector approveConnector(String id, String tenantId) {
        log.info("Approving connector: id={}, tenantId={}", id, tenantId);
        
        ConnectorId connectorId = ConnectorId.from(id);
        Connector connector = connectorRepository.findByIdAndTenantId(connectorId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException(
                String.format(ErrorMessages.NOT_FOUND_WITH_ID, "Connector", id)
            ));
        
        connector.approve();  // Business method
        Connector saved = connectorRepository.save(connector);
        
        log.info("Connector approved: id={}, name={}, status={}",
            id, saved.getName(), saved.getStatus());
        
        return saved;
    }

    /**
     * Reject connector.
     */
    @Transactional
    public Connector rejectConnector(String id, String tenantId) {
        log.info("Rejecting connector: id={}, tenantId={}", id, tenantId);
        
        ConnectorId connectorId = ConnectorId.from(id);
        Connector connector = connectorRepository.findByIdAndTenantId(connectorId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException(
                String.format(ErrorMessages.NOT_FOUND_WITH_ID, "Connector", id)
            ));
        
        connector.reject();  // Business method
        Connector saved = connectorRepository.save(connector);
        
        log.info("Connector rejected: id={}, name={}, status={}",
            id, saved.getName(), saved.getStatus());
        
        return saved;
    }

    /**
     * Update approval status (approve or reject).
     */
    @Transactional
    public Connector updateApprovalStatus(String id, String status, String tenantId) {
        if ("APPROVED".equals(status)) {
            return approveConnector(id, tenantId);
        } else if ("REJECTED".equals(status)) {
            return rejectConnector(id, tenantId);
        } else {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
    }

    /**
     * Delete connector.
     */
    @Transactional
    public void deleteConnector(String id, String tenantId) {
        log.warn("Deleting connector: id={}, tenantId={}", id, tenantId);
        
        ConnectorId connectorId = ConnectorId.from(id);
        Connector connector = connectorRepository.findByIdAndTenantId(connectorId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException(
                String.format(ErrorMessages.NOT_FOUND_WITH_ID, "Connector", id)
            ));
        
        connectorRepository.delete(connector);
        log.info("Connector deleted: id={}, name={}", id, connector.getName());
    }

    /**
     * Test connection and fetch tables (delegates to domain service).
     */
    public List<TableMetadata> testConnectionAndFetchTables(Map<String, Object> config) {
        log.debug("Testing connection with config keys: {}", config.keySet());
        
        try {
            List<TableMetadata> tables = connectorMetadataService.testConnectionAndFetchTables(config);
            log.info("Connection test successful: found {} tables", tables.size());

            return tables;
        } catch (Exception ex) {
            log.error("Connection test failed: {}", ex.getMessage());
            throw new RuntimeException(ex);
        }
    }

    /**
     * Test connection for an existing connector.
     */
    public void testConnection(String id, String tenantId) {
        ConnectorId connectorId = ConnectorId.from(id);
        Connector connector = connectorRepository.findByIdAndTenantId(connectorId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException(
                String.format(ErrorMessages.NOT_FOUND_WITH_ID, "Connector", id)
            ));
        
        // Reuse connector's stored config directly
        connectorMetadataService.testConnectionAndFetchTables(connector);
    }

    /**
     * Get tables for a connector (delegates to domain service).
     */
    public List<TableMetadata> getTables(String id, String tenantId) {
        ConnectorId connectorId = ConnectorId.from(id);
        Connector connector = connectorRepository.findByIdAndTenantId(connectorId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException(
                String.format(ErrorMessages.NOT_FOUND_WITH_ID, "Connector", id)
            ));
        
        return connector.getRegisteredTables();
    }
}
