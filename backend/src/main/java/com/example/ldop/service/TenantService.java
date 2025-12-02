package com.example.ldop.service;

import com.example.ldop.constant.ErrorMessages;
import com.example.ldop.domain.Tenant;
import com.example.ldop.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;

    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    public Optional<Tenant> getTenantById(String id) {
        return tenantRepository.findById(id);
    }

    @Transactional
    public Tenant createTenant(Tenant tenant) {
        if (tenantRepository.existsById(tenant.getId())) {
            throw new IllegalArgumentException(
                String.format(ErrorMessages.ALREADY_EXISTS, "Tenant", tenant.getId())
            );
        }
        return tenantRepository.save(tenant);
    }

    @Transactional
    public Tenant updateTenant(String id, Tenant tenantDetails) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                    String.format(ErrorMessages.TENANT_NOT_FOUND_WITH_ID, id)
                ));
        
        tenant.setName(tenantDetails.getName());
        tenant.setDescription(tenantDetails.getDescription());
        tenant.setStatus(tenantDetails.getStatus());
        
        return tenantRepository.save(tenant);
    }

    @Transactional
    public void deleteTenant(String id) {
        if (!tenantRepository.existsById(id)) {
            throw new IllegalArgumentException(
                String.format(ErrorMessages.TENANT_NOT_FOUND_WITH_ID, id)
            );
        }
        tenantRepository.deleteById(id);
    }

    public List<Tenant> getTenantsByStatus(String status) {
        return tenantRepository.findByStatus(status);
    }

    @Transactional
    public Tenant updateTenantStatus(String id, String status) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                    String.format(ErrorMessages.TENANT_NOT_FOUND_WITH_ID, id)
                ));
        
        tenant.setStatus(status);
        return tenantRepository.save(tenant);
    }
}
