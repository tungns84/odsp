package com.gs.dsp.iam.infrastructure.persistence;

import com.gs.dsp.iam.domain.model.Tenant;
import com.gs.dsp.iam.domain.model.TenantId;
import com.gs.dsp.iam.domain.repository.TenantRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaTenantRepository extends JpaRepository<Tenant, TenantId>, TenantRepository {
}
