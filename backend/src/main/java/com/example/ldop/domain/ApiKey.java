package com.example.ldop.domain;

import com.example.ldop.constant.AppConstants;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "api_keys", indexes = {
    @Index(name = "idx_key_hash", columnList = "key_hash"),
    @Index(name = "idx_tenant_api", columnList = "tenant_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiKey implements org.springframework.data.domain.Persistable<UUID> {
    @Id
    private UUID id;

    @NotBlank(message = "Tenant ID is required")
    @Size(max = 50, message = "Tenant ID must not exceed 50 characters")
    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @NotBlank(message = "API key name is required")
    @Size(max = 255, message = "API key name must not exceed 255 characters")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Key hash is required")
    @Column(name = "key_hash", nullable = false)
    private String keyHash;

    @NotBlank(message = "Prefix is required")
    @Size(max = 10, message = "Prefix must not exceed 10 characters")
    @Column(nullable = false, length = 10)
    private String prefix;

    @NotBlank(message = "Status is required")
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = AppConstants.STATUS_ACTIVE; // ACTIVE, REVOKED, EXPIRED

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostLoad
    @PrePersist
    void markNotNew() {
        this.isNew = false;
    }
}
