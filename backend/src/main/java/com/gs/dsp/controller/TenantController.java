package com.gs.dsp.controller;

import com.gs.dsp.iam.application.service.TenantApplicationService;
import com.gs.dsp.iam.domain.model.Tenant;
import com.gs.dsp.iam.domain.model.TenantStatus;
import com.gs.dsp.dto.TenantDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
@Tag(name = "Tenant Management", description = "APIs for managing tenants")
public class TenantController {

    private final TenantApplicationService tenantService;

    @GetMapping
    @Operation(summary = "Get all tenants", description = "Retrieve list of all tenants with optional status filter")
    public ResponseEntity<List<TenantDTO.TenantResponse>> getAllTenants(
            @RequestParam(required = false) String status) {
        List<Tenant> tenants;
        
        if (status != null && !status.isEmpty()) {
            try {
                TenantStatus tenantStatus = TenantStatus.valueOf(status.toUpperCase());
                tenants = tenantService.getTenantsByStatus(tenantStatus);
            } catch (IllegalArgumentException e) {
                // Invalid status, return empty or all? Returning empty seems safer or bad request
                return ResponseEntity.badRequest().build();
            }
        } else {
            tenants = tenantService.getAllTenants();
        }
        
        List<TenantDTO.TenantResponse> response = tenants.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tenant by ID", description = "Retrieve a specific tenant by ID")
    public ResponseEntity<TenantDTO.TenantResponse> getTenantById(@PathVariable String id) {
        return tenantService.getTenantById(id)
                .map(tenant -> ResponseEntity.ok(toResponse(tenant)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create tenant", description = "Create a new tenant")
    public ResponseEntity<TenantDTO.TenantResponse> createTenant(
            @Valid @RequestBody TenantDTO.CreateTenantRequest request) {
        Tenant created = tenantService.createTenant(request.getId(), request.getName(), request.getDescription());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update tenant", description = "Update an existing tenant")
    public ResponseEntity<TenantDTO.TenantResponse> updateTenant(
            @PathVariable String id,
            @Valid @RequestBody TenantDTO.UpdateTenantRequest request) {
        
        TenantStatus status = null;
        if (request.getStatus() != null) {
            try {
                status = TenantStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        Tenant updated = tenantService.updateTenant(id, request.getName(), request.getDescription(), status);
        return ResponseEntity.ok(toResponse(updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete tenant", description = "Soft delete a tenant by setting status to INACTIVE")
    public ResponseEntity<Void> deleteTenant(@PathVariable String id) {
        tenantService.deleteTenant(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update tenant status", description = "Update tenant status (ACTIVE/INACTIVE)")
    public ResponseEntity<TenantDTO.TenantResponse> updateTenantStatus(
            @PathVariable String id,
            @Valid @RequestBody TenantDTO.TenantStatusUpdateRequest request) {
        
        TenantStatus status;
        try {
            status = TenantStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        Tenant updated = tenantService.updateTenantStatus(id, status);
        return ResponseEntity.ok(toResponse(updated));
    }

    private TenantDTO.TenantResponse toResponse(Tenant tenant) {
        return TenantDTO.TenantResponse.builder()
                .id(tenant.getIdValue())
                .name(tenant.getName())
                .description(tenant.getDescription())
                .status(tenant.getStatus().name())
                .createdAt(tenant.getCreatedAt())
                .updatedAt(tenant.getUpdatedAt())
                .build();
    }
}
