package com.gs.dsp.connectivity.infrastructure.persistence;

import com.gs.dsp.connectivity.domain.model.Connector;
import com.gs.dsp.connectivity.domain.model.ConnectorId;
import com.gs.dsp.connectivity.domain.repository.ConnectorRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * JPA repository implementation for Connector.
 * Extends both Spring Data JpaRepository and domain ConnectorRepository.
 * Spring Data automatically implements the domain interface methods.
 */
@Repository
public interface JpaConnectorRepository 
        extends JpaRepository<Connector, ConnectorId>, ConnectorRepository {
    
    // Spring Data auto-implements:
    // - findById(ConnectorId)
    // - findByTenantId(String)
    // - findByIdAndTenantId(ConnectorId, String)
    // - save(Connector)
    // - delete(Connector)
    // - existsById(ConnectorId)
    // - findAll()
}
