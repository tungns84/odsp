package com.gs.dsp.iam.domain.repository;

import com.gs.dsp.iam.domain.model.Tenant;
import com.gs.dsp.iam.domain.model.TenantId;
import com.gs.dsp.iam.domain.model.TenantStatus;

import java.util.List;
import java.util.Optional;

public interface TenantRepository {
    List<Tenant> findAll();
    Optional<Tenant> findById(TenantId id);
    Tenant save(Tenant tenant);
    void deleteById(TenantId id);
    boolean existsById(TenantId id);
    List<Tenant> findByStatus(TenantStatus status);
}
