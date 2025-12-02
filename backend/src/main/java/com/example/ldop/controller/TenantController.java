package com.example.ldop.controller;

import com.example.ldop.constant.AppConstants;
import com.example.ldop.domain.Tenant;
import com.example.ldop.dto.TenantDTO;
import com.example.ldop.service.TenantService;
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

    private final TenantService tenantService;

    @GetMapping
    @Operation(summary = "Get all tenants", description = "Retrieve list of all tenants with optional status filter")
    public ResponseEntity<List<TenantDTO.TenantResponse>> getAllTenants(
            @RequestParam(required = false) String status) {
        List<Tenant> tenants;
        
        if (status != null && !status.isEmpty()) {
            tenants = tenantService.getTenantsByStatus(status);
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
        Tenant tenant = Tenant.builder()
                .id(request.getId())
                .name(request.getName())
                .description(request.getDescription())
                .status(AppConstants.STATUS_ACTIVE)
                .build();
        
        Tenant created = tenantService.createTenant(tenant);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update tenant", description = "Update an existing tenant")
    public ResponseEntity<TenantDTO.TenantResponse> updateTenant(
            @PathVariable String id,
            @Valid @RequestBody TenantDTO.UpdateTenantRequest request) {
        Tenant tenantDetails = Tenant.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus())
                .build();
        
        Tenant updated = tenantService.updateTenant(id, tenantDetails);
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
        Tenant updated = tenantService.updateTenantStatus(id, request.getStatus());
        return ResponseEntity.ok(toResponse(updated));
    }

    private TenantDTO.TenantResponse toResponse(Tenant tenant) {
        return TenantDTO.TenantResponse.builder()
                .id(tenant.getId())
                .name(tenant.getName())
                .description(tenant.getDescription())
                .status(tenant.getStatus())
                .createdAt(tenant.getCreatedAt())
                .updatedAt(tenant.getUpdatedAt())
                .build();
    }
}
