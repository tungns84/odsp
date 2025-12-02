package com.gs.dsp.connectivity.application.service;

import com.gs.dsp.connectivity.domain.model.*;
import com.gs.dsp.connectivity.domain.repository.ConnectorRepository;
import com.gs.dsp.dto.TableMetadata;
import com.gs.dsp.service.ConnectorService;
import com.gs.dsp.shared.kernel.constants.ErrorMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Application Service for Connector aggregate.
 * Orchestrates use cases for connector management.
 */
@Service
@RequiredArgsConstructor
public class ConnectorApplicationService {
    
    private final ConnectorRepository connectorRepository;
    private final ConnectorService connectorService;  // Infrastructure service for table fetching

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
    @Transactional
    public Connector createConnector(
            String name,
            String type,
            Map<String, Object> config,
            String tenantId) {
        
        ConnectorId id = ConnectorId.generate();
        ConnectorType connectorType = new ConnectorType(type);
        ConnectionConfig connectionConfig = new ConnectionConfig(config);
        
        Connector connector = Connector.create(
            id,
            name,
            connectorType,
            connectionConfig,
            tenantId
        );
        
        return connectorRepository.save(connector);
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
        ConnectorId connectorId = ConnectorId.from(id);
        Connector connector = connectorRepository.findByIdAndTenantId(connectorId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException(
                String.format(ErrorMessages.NOT_FOUND_WITH_ID, "Connector", id)
            ));
        
        connector.approve();  // Business method
        
        return connectorRepository.save(connector);
    }

    /**
     * Reject connector.
     */
    @Transactional
    public Connector rejectConnector(String id, String tenantId) {
        ConnectorId connectorId = ConnectorId.from(id);
        Connector connector = connectorRepository.findByIdAndTenantId(connectorId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException(
                String.format(ErrorMessages.NOT_FOUND_WITH_ID, "Connector", id)
            ));
        
        connector.reject();  // Business method
        
        return connectorRepository.save(connector);
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
        ConnectorId connectorId = ConnectorId.from(id);
        Connector connector = connectorRepository.findByIdAndTenantId(connectorId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException(
                String.format(ErrorMessages.NOT_FOUND_WITH_ID, "Connector", id)
            ));
        
        connectorRepository.delete(connector);
    }

    /**
     * Test connection and fetch tables (delegates to infrastructure service).
     */
    public List<TableMetadata> testConnectionAndFetchTables(Map<String, Object> config) {
        return connectorService.testConnectionAndFetchTables(config);
    }

    /**
     * Get tables for a connector (delegates to infrastructure service).
     */
    public List<TableMetadata> getTables(String id, String tenantId) {
        ConnectorId connectorId = ConnectorId.from(id);
        Connector connector = connectorRepository.findByIdAndTenantId(connectorId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException(
                String.format(ErrorMessages.NOT_FOUND_WITH_ID, "Connector", id)
            ));
        
        return connectorService.fetchTables(connector);
    }
}
