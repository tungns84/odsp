package com.gs.dsp.iam.domain.repository;

import com.gs.dsp.iam.domain.model.ApiKey;
import com.gs.dsp.iam.domain.model.ApiKeyId;
import com.gs.dsp.iam.domain.model.TenantId;

import java.util.List;
import java.util.Optional;

public interface ApiKeyRepository {
    List<ApiKey> findByTenantId(TenantId tenantId);
    Optional<ApiKey> findByKeyHash(String keyHash);
    Optional<ApiKey> findById(ApiKeyId id);
    ApiKey save(ApiKey apiKey);
    void deleteById(ApiKeyId id);
}
