package com.gs.dsp.connectivity.domain.repository;

import com.gs.dsp.connectivity.domain.model.Connector;
import com.gs.dsp.connectivity.domain.model.ConnectorId;

import java.util.List;
import java.util.Optional;

/**
 * Domain repository interface for Connector aggregate.
 * This is a pure domain interface, not tied to any persistence framework.
 */
public interface ConnectorRepository {
    
    /**
     * Find connector by ID.
     */
    Optional<Connector> findById(ConnectorId id);
    
    /**
     * Find all connectors for a tenant.
     */
    List<Connector> findByTenantId(String tenantId);
    
    /**
     * Find connector by ID and tenant ID (for tenant isolation).
     */
    Optional<Connector> findByIdAndTenantId(ConnectorId id, String tenantId);
    
    /**
     * Save connector (create or update).
     */
    Connector save(Connector connector);
    
    /**
     * Delete connector.
     */
    void delete(Connector connector);
    
    /**
     * Check if connector exists by ID.
     */
    boolean existsById(ConnectorId id);
    
    /**
     * Find all connectors.
     */
    List<Connector> findAll();
}
