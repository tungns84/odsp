package com.gs.dsp.iam.infrastructure.primary.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Data Transfer Objects for API Key operations
 */
public class ApiKeyDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApiKeyResponse {
        private UUID id;
        private String tenantId;
        private String name;
        private String prefix;
        private String status;
        private LocalDateTime expiresAt;
        private LocalDateTime lastUsedAt;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApiKeyCreationResponse {
        private UUID id;
        private String tenantId;
        private String name;
        private String rawKey; // Only included on creation
        private String prefix;
        private String status;
        private LocalDateTime expiresAt;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateApiKeyRequest {
        private String name;
        private LocalDateTime expiresAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApiKeyListItemResponse {
        private UUID id;
        private String name;
        private String prefix;
        private String status;
        private LocalDateTime lastUsedAt;
        private LocalDateTime expiresAt;
        private LocalDateTime createdAt;
    }
}
