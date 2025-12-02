package com.gs.dsp.iam.domain.model;

import com.gs.dsp.shared.domain.model.AggregateRoot;
import com.gs.dsp.shared.kernel.constants.AppConstants;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tenants")
@Getter
@NoArgsConstructor
public class Tenant extends AggregateRoot<TenantId> {

    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id", length = 50))
    private TenantId id;

    @NotBlank(message = "Tenant name is required")
    @Size(max = 255, message = "Tenant name must not exceed 255 characters")
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TenantStatus status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Factory method
    public static Tenant create(TenantId id, String name, String description) {
        Tenant tenant = new Tenant();
        tenant.id = id;
        tenant.name = name;
        tenant.description = description;
        tenant.status = TenantStatus.ACTIVE;
        return tenant;
    }

    // Business behaviors
    public void updateDetails(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public void activate() {
        if (this.status == TenantStatus.ACTIVE) {
            return;
        }
        this.status = TenantStatus.ACTIVE;
    }

    public void deactivate() {
        if (this.status == TenantStatus.INACTIVE) {
            return;
        }
        this.status = TenantStatus.INACTIVE;
    }
    
    public String getIdValue() {
        return id != null ? id.getId() : null;
    }
}
