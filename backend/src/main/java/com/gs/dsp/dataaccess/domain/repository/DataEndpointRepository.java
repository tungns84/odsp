package com.gs.dsp.dataaccess.domain.repository;

import com.gs.dsp.dataaccess.domain.model.DataEndpoint;
import com.gs.dsp.dataaccess.domain.model.DataEndpointId;

import java.util.List;
import java.util.Optional;

/**
 * Domain repository interface for DataEndpoint aggregate.
 * Pure domain interface with no Spring Data dependencies.
 */
public interface DataEndpointRepository {
    
    Optional<DataEndpoint> findById(DataEndpointId id);
    
    List<DataEndpoint> findByTenantId(String tenantId);
    
    Optional<DataEndpoint> findByIdAndTenantId(DataEndpointId id, String tenantId);
    
    Optional<DataEndpoint> findByPathAliasAndTenantId(String pathAlias, String tenantId);
    
    DataEndpoint save(DataEndpoint endpoint);
    
    void delete(DataEndpoint endpoint);
    
    boolean existsByPathAliasAndTenantId(String pathAlias, String tenantId);

    void deleteAll();
}
