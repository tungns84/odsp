package com.gs.dsp.dataaccess.application.service;

import com.gs.dsp.connectivity.domain.model.Connector;
import com.gs.dsp.connectivity.domain.repository.ConnectorRepository;
import com.gs.dsp.connectivity.domain.model.ConnectorId;
import com.gs.dsp.dataaccess.domain.model.DataEndpoint;
import com.gs.dsp.dataaccess.domain.model.DataEndpointId;
import com.gs.dsp.dataaccess.domain.repository.DataEndpointRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gs.dsp.shared.domain.exception.BusinessException;
import com.gs.dsp.shared.domain.exception.ResourceNotFoundException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


/**
 * Application service for DataEndpoint aggregate.
 * Orchestrates use cases and coordinates between domain and infrastructure layers.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DataEndpointApplicationService {
    
    private final DataEndpointRepository dataEndpointRepository;
    private final ConnectorRepository connectorRepository;
    
    /**
     * Get all endpoints for a tenant
     */
    public List<DataEndpoint> getAllEndpoints(String tenantId) {
        return dataEndpointRepository.findByTenantId(tenantId);
    }
    
    /**
     * Get endpoint by ID and tenant
     */
    public Optional<DataEndpoint> getEndpointById(String id, String tenantId) {
        DataEndpointId endpointId = new DataEndpointId(UUID.fromString(id));
        return dataEndpointRepository.findByIdAndTenantId(endpointId, tenantId);
    }
    
    /**
     * Get endpoint by path alias and tenant
     */
    public Optional<DataEndpoint> getEndpointByPathAlias(String pathAlias, String tenantId) {
        return dataEndpointRepository.findByPathAliasAndTenantId(pathAlias, tenantId);
    }
    
    /**
     * Create a new data endpoint
     */
    @Transactional
    public DataEndpoint createEndpoint(
            String connectorIdStr,
            String name,
            String pathAlias,
            String description,
            String queryConfig,
            String fieldConfig,
            String tenantId) {
        
        log.info("Creating data endpoint: name={}, pathAlias={}, connectorId={}, tenantId={}",
            name, pathAlias, connectorIdStr, tenantId);
        
        // Validate path alias uniqueness
        if (dataEndpointRepository.existsByPathAliasAndTenantId(pathAlias, tenantId)) {
            throw new BusinessException("DUPLICATE_ALIAS", "Path alias already exists: " + pathAlias);
        }
        
        // Load connector
        ConnectorId connectorId = new ConnectorId(UUID.fromString(connectorIdStr));
        Connector connector = connectorRepository.findByIdAndTenantId(connectorId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Connector", connectorIdStr));
        
        // Create endpoint using factory method
        DataEndpointId id = DataEndpointId.generate();
        DataEndpoint endpoint = DataEndpoint.create(id, connector, name, pathAlias, tenantId);
        
        // Set optional fields
        if (description != null && !description.isBlank()) {
            endpoint.updateDetails(name, description);
        }
        
        if (queryConfig != null) {
            endpoint.updateQueryConfig(queryConfig);
        }
        
        if (fieldConfig != null) {
            endpoint.updateFieldMaskingConfig(fieldConfig);
        }
        
        // Activate immediately (or keep as DRAFT based on requirements)
        //endpoint.activate();
        
        DataEndpoint saved = dataEndpointRepository.save(endpoint);
        log.info("Data endpoint created successfully: id={}, pathAlias={}, status={}",
            saved.getIdValue(), saved.getPathAlias(), saved.getStatus());
        
        return saved;
    }
    
    /**
     * Update an existing endpoint
     */
    @Transactional
    public DataEndpoint updateEndpoint(
            String id,
            String name,
            String description,
            String queryConfig,
            String fieldConfig,
            String tenantId) {
        
        log.info("Updating data endpoint: id={}, tenantId={}", id, tenantId);
        
        DataEndpointId endpointId = new DataEndpointId(UUID.fromString(id));
        DataEndpoint endpoint = dataEndpointRepository.findByIdAndTenantId(endpointId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("DataEndpoint", id));
        
        // Update using business methods
        if (name != null || description != null) {
            endpoint.updateDetails(
                name != null ? name : endpoint.getName(),
                description != null ? description : endpoint.getDescription()
            );
        }
        
        if (queryConfig != null) {
            endpoint.updateQueryConfig(queryConfig);
        }
        
        if (fieldConfig != null) {
            endpoint.updateFieldMaskingConfig(fieldConfig);
        }
        
        DataEndpoint saved = dataEndpointRepository.save(endpoint);
        log.info("Data endpoint updated: id={}, pathAlias={}", id, saved.getPathAlias());
        
        return saved;
    }
    
    /**
     * Activate an endpoint
     */
    @Transactional
    public DataEndpoint activateEndpoint(String id, String tenantId) {
        DataEndpointId endpointId = new DataEndpointId(UUID.fromString(id));
        DataEndpoint endpoint = dataEndpointRepository.findByIdAndTenantId(endpointId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("DataEndpoint", id));
        
        endpoint.activate();
        return dataEndpointRepository.save(endpoint);
    }
    
    /**
     * Deactivate an endpoint
     */
    @Transactional
    public DataEndpoint deactivateEndpoint(String id, String tenantId) {
        DataEndpointId endpointId = new DataEndpointId(UUID.fromString(id));
        DataEndpoint endpoint = dataEndpointRepository.findByIdAndTenantId(endpointId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("DataEndpoint", id));
        
        endpoint.deactivate();
        return dataEndpointRepository.save(endpoint);
    }
    
    /**
     * Delete an endpoint
     */
    @Transactional
    public void deleteEndpoint(String id, String tenantId) {
        log.warn("Deleting data endpoint: id={}, tenantId={}", id, tenantId);
        
        DataEndpointId endpointId = new DataEndpointId(UUID.fromString(id));
        DataEndpoint endpoint = dataEndpointRepository.findByIdAndTenantId(endpointId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("DataEndpoint", id));
        
        if (endpoint.getStatus() == com.gs.dsp.dataaccess.domain.model.DataEndpointStatus.ACTIVE) {
            throw new BusinessException("ENDPOINT_ACTIVE", "Cannot delete active endpoint. Please deactivate it first.");
        }
        
        dataEndpointRepository.delete(endpoint);
        log.info("Data endpoint deleted: id={}, pathAlias={}", id, endpoint.getPathAlias());
    }
}
