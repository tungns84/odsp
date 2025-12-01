package com.example.ldop.controller;

import com.example.ldop.domain.ApiKey;
import com.example.ldop.dto.ApiKeyDTO;
import com.example.ldop.service.ApiKeyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "API Key Management", description = "APIs for managing API keys")
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    @GetMapping("/tenants/{tenantId}/api-keys")
    @Operation(summary = "Get all API keys for a tenant", description = "Retrieve list of all API keys for a specific tenant")
    public ResponseEntity<List<ApiKeyDTO.ApiKeyListItemResponse>> getApiKeysByTenant(
            @PathVariable String tenantId,
            @RequestParam(required = false) String status) {
        List<ApiKey> apiKeys;
        
        if (status != null && !status.isEmpty()) {
            apiKeys = apiKeyService.getApiKeysByTenantAndStatus(tenantId, status);
        } else {
            apiKeys = apiKeyService.getApiKeysByTenant(tenantId);
        }
        
        List<ApiKeyDTO.ApiKeyListItemResponse> response = apiKeys.stream()
                .map(this::toListItemResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/tenants/{tenantId}/api-keys")
    @Operation(summary = "Generate new API key", description = "Generate a new API key for a tenant. The raw key is only returned once and cannot be retrieved again.")
    public ResponseEntity<ApiKeyDTO.ApiKeyCreationResponse> generateApiKey(
            @PathVariable String tenantId,
            @Valid @RequestBody ApiKeyDTO.CreateApiKeyRequest request) {
        String rawKey = apiKeyService.generateApiKey(tenantId, request.getName(), request.getExpiresAt());
        
        // Fetch the created API key to get all details
        List<ApiKey> keys = apiKeyService.getApiKeysByTenant(tenantId);
        ApiKey createdKey = keys.stream()
                .filter(k -> k.getName().equals(request.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve created API key"));
        
        ApiKeyDTO.ApiKeyCreationResponse response = ApiKeyDTO.ApiKeyCreationResponse.builder()
                .id(createdKey.getId())
                .tenantId(createdKey.getTenantId())
                .name(createdKey.getName())
                .rawKey(rawKey)
                .prefix(createdKey.getPrefix())
                .status(createdKey.getStatus())
                .expiresAt(createdKey.getExpiresAt())
                .createdAt(createdKey.getCreatedAt())
                .build();
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api-keys/{id}")
    @Operation(summary = "Get API key details", description = "Get details of a specific API key (raw key not included)")
    public ResponseEntity<ApiKeyDTO.ApiKeyResponse> getApiKeyById(@PathVariable UUID id) {
        return apiKeyService.getApiKeyById(id)
                .map(apiKey -> ResponseEntity.ok(toResponse(apiKey)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/api-keys/{id}/revoke")
    @Operation(summary = "Revoke API key", description = "Revoke an API key, setting its status to REVOKED")
    public ResponseEntity<ApiKeyDTO.ApiKeyResponse> revokeApiKey(@PathVariable UUID id) {
        apiKeyService.revokeApiKey(id);
        
        return apiKeyService.getApiKeyById(id)
                .map(apiKey -> ResponseEntity.ok(toResponse(apiKey)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api-keys/{id}")
    @Operation(summary = "Delete API key", description = "Permanently delete an API key")
    public ResponseEntity<Void> deleteApiKey(@PathVariable UUID id) {
        apiKeyService.deleteApiKey(id);
        return ResponseEntity.noContent().build();
    }

    private ApiKeyDTO.ApiKeyResponse toResponse(ApiKey apiKey) {
        return ApiKeyDTO.ApiKeyResponse.builder()
                .id(apiKey.getId())
                .tenantId(apiKey.getTenantId())
                .name(apiKey.getName())
                .prefix(apiKey.getPrefix())
                .status(apiKey.getStatus())
                .expiresAt(apiKey.getExpiresAt())
                .lastUsedAt(apiKey.getLastUsedAt())
                .createdAt(apiKey.getCreatedAt())
                .build();
    }

    private ApiKeyDTO.ApiKeyListItemResponse toListItemResponse(ApiKey apiKey) {
        return ApiKeyDTO.ApiKeyListItemResponse.builder()
                .id(apiKey.getId())
                .name(apiKey.getName())
                .prefix(apiKey.getPrefix())
                .status(apiKey.getStatus())
                .lastUsedAt(apiKey.getLastUsedAt())
                .expiresAt(apiKey.getExpiresAt())
                .createdAt(apiKey.getCreatedAt())
                .build();
    }
}
