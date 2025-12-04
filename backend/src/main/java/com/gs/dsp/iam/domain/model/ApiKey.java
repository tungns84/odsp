package com.gs.dsp.iam.domain.model;

import com.gs.dsp.shared.domain.model.AggregateRoot;
import com.gs.dsp.shared.kernel.constants.AppConstants;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "api_keys", indexes = {
    @Index(name = "idx_key_hash", columnList = "key_hash"),
    @Index(name = "idx_tenant_api", columnList = "tenant_id")
})
@Getter
@NoArgsConstructor
public class ApiKey extends AggregateRoot<ApiKeyId> {

    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id"))
    private ApiKeyId id;

    @Embedded
    @AttributeOverride(name = "id", column = @Column(name = "tenant_id", nullable = false, length = 50))
    private TenantId tenantId;

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
    private String status;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Factory method
    public static ApiKey create(ApiKeyId id, TenantId tenantId, String name, String keyHash, String prefix, LocalDateTime expiresAt) {
        ApiKey apiKey = new ApiKey();
        apiKey.id = id;
        apiKey.tenantId = tenantId;
        apiKey.name = name;
        apiKey.keyHash = keyHash;
        apiKey.prefix = prefix;
        apiKey.expiresAt = expiresAt;
        apiKey.status = AppConstants.STATUS_ACTIVE;
        return apiKey;
    }

    // Business methods
    public void revoke() {
        this.status = "REVOKED";
    }

    public void updateLastUsedAt() {
        this.lastUsedAt = LocalDateTime.now();
    }

    public String getIdValue() {
        return id != null ? id.toString() : null;
    }
}
