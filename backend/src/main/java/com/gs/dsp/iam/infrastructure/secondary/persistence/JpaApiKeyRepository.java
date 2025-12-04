package com.gs.dsp.iam.infrastructure.secondary.persistence;

import com.gs.dsp.iam.domain.model.ApiKey;
import com.gs.dsp.iam.domain.model.ApiKeyId;
import com.gs.dsp.iam.domain.repository.ApiKeyRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaApiKeyRepository extends JpaRepository<ApiKey, ApiKeyId>, ApiKeyRepository {
}
