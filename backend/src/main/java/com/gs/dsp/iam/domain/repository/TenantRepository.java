package com.gs.dsp.iam.domain.repository;

import com.gs.dsp.iam.domain.model.Tenant;
import com.gs.dsp.iam.domain.model.TenantId;
import com.gs.dsp.iam.domain.model.TenantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, TenantId> {
    List<Tenant> findByStatus(TenantStatus status);
}
