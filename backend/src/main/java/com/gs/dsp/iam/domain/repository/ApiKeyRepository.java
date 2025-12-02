package com.gs.dsp.iam.domain.repository;

import com.gs.dsp.iam.domain.model.ApiKey;
import com.gs.dsp.iam.domain.model.TenantId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, UUID> {
    List<ApiKey> findByTenantId(TenantId tenantId);
    Optional<ApiKey> findByKeyHash(String keyHash);
}
