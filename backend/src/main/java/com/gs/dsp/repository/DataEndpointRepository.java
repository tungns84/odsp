package com.gs.dsp.repository;

import com.gs.dsp.domain.DataEndpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DataEndpointRepository extends JpaRepository<DataEndpoint, UUID> {
    List<DataEndpoint> findAllByTenantId(String tenantId);
    Optional<DataEndpoint> findByPathAliasAndTenantId(String pathAlias, String tenantId);
    Optional<DataEndpoint> findByIdAndTenantId(UUID id, String tenantId);
}
