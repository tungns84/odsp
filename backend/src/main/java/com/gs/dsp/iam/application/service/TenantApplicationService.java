package com.gs.dsp.iam.application.service;

import com.gs.dsp.iam.domain.model.Tenant;
import com.gs.dsp.iam.domain.model.TenantId;
import com.gs.dsp.iam.domain.model.TenantStatus;
import com.gs.dsp.iam.domain.repository.TenantRepository;
import com.gs.dsp.shared.kernel.constants.ErrorMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TenantApplicationService {

    private final TenantRepository tenantRepository;

    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    public Optional<Tenant> getTenantById(String id) {
        return tenantRepository.findById(new TenantId(id));
    }

    @Transactional
    public Tenant createTenant(String id, String name, String description) {
        TenantId tenantId = new TenantId(id);
        if (tenantRepository.existsById(tenantId)) {
            throw new IllegalArgumentException(
                String.format(ErrorMessages.ALREADY_EXISTS, "Tenant", id)
            );
        }
        Tenant tenant = Tenant.create(tenantId, name, description);
        return tenantRepository.save(tenant);
    }

    @Transactional
    public Tenant updateTenant(String id, String name, String description, TenantStatus status) {
        TenantId tenantId = new TenantId(id);
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException(
                    String.format(ErrorMessages.TENANT_NOT_FOUND_WITH_ID, id)
                ));
        
        tenant.updateDetails(name, description);
        
        if (status != null) {
            if (status == TenantStatus.ACTIVE) {
                tenant.activate();
            } else if (status == TenantStatus.INACTIVE) {
                tenant.deactivate();
            }
        }
        
        return tenantRepository.save(tenant);
    }

    @Transactional
    public void deleteTenant(String id) {
        TenantId tenantId = new TenantId(id);
        if (!tenantRepository.existsById(tenantId)) {
            throw new IllegalArgumentException(
                String.format(ErrorMessages.TENANT_NOT_FOUND_WITH_ID, id)
            );
        }
        // Hard delete for now, or soft delete if status is used
        // In DDD, we might prefer deactivating instead of deleting
        // But to keep parity with legacy service:
        tenantRepository.deleteById(tenantId);
    }

    public List<Tenant> getTenantsByStatus(TenantStatus status) {
        return tenantRepository.findByStatus(status);
    }

    @Transactional
    public Tenant updateTenantStatus(String id, TenantStatus status) {
        TenantId tenantId = new TenantId(id);
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException(
                    String.format(ErrorMessages.TENANT_NOT_FOUND_WITH_ID, id)
                ));
        
        if (status == TenantStatus.ACTIVE) {
            tenant.activate();
        } else {
            tenant.deactivate();
        }
        return tenantRepository.save(tenant);
    }
}
