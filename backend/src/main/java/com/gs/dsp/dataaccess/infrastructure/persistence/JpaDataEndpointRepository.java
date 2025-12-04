package com.gs.dsp.dataaccess.infrastructure.persistence;

import com.gs.dsp.dataaccess.domain.model.DataEndpoint;
import com.gs.dsp.dataaccess.domain.model.DataEndpointId;
import com.gs.dsp.dataaccess.domain.repository.DataEndpointRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * JPA implementation of DataEndpointRepository.
 * Spring Data auto-implements most methods.
 */
@Repository
public interface JpaDataEndpointRepository 
        extends JpaRepository<DataEndpoint, DataEndpointId>, 
                DataEndpointRepository {
    // Spring Data auto-implements:
    // - findById(DataEndpointId)
    // - findByTenantId(String)
    // - findByIdAndTenantId(DataEndpointId, String)
    // - findByPathAliasAndTenantId(String, String)
    // - save(DataEndpoint)
    // - delete(DataEndpoint)
    // - existsByPathAliasAndTenantId(String, String)
}
