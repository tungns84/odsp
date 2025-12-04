package com.gs.dsp.connectivity.domain.model;

import com.gs.dsp.connectivity.infrastructure.primary.dto.TableMetadata;
import com.gs.dsp.shared.domain.model.AggregateRoot;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Connector Aggregate Root.
 * Manages database/API connectors with approval workflow.
 */
@Entity
@Table(name = "connectors")
@Getter
@NoArgsConstructor  // For JPA only
public class Connector extends AggregateRoot<ConnectorId> {
    
    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id"))
    private ConnectorId id;
    
    @Column(nullable = false)
    private String name;
    
    @Embedded
    private ConnectorType type;
    
    @Embedded
    private ConnectionConfig config;
    
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConnectorStatus status;
    
    @Column(name = "is_active")
    private boolean isActive;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<TableMetadata> registeredTables;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Factory method
    public static Connector create(
            ConnectorId id,
            String name,
            ConnectorType type,
            ConnectionConfig config,
            String tenantId) {
        
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Connector name cannot be blank");
        }
        if (tenantId == null || tenantId.isBlank()) {
            throw new IllegalArgumentException("Tenant ID cannot be blank");
        }
        
        Connector connector = new Connector();
        connector.id = id;
        connector.name = name;
        connector.type = type;
        connector.config = config;
        connector.tenantId = tenantId;
        connector.status = ConnectorStatus.INIT;
        connector.isActive = false;
        
        return connector;
    }

    // Business method: Approve connector
    public void approve() {
        if (this.status == ConnectorStatus.APPROVED) {
            return; // Idempotent
        }
        if (this.status == ConnectorStatus.REJECTED) {
            throw new IllegalStateException("Cannot approve a rejected connector");
        }
        this.status = ConnectorStatus.APPROVED;
        this.isActive = true;
    }

    // Business method: Reject connector
    public void reject() {
        if (this.status == ConnectorStatus.REJECTED) {
            return; // Idempotent
        }
        this.status = ConnectorStatus.REJECTED;
        this.isActive = false;
    }

    // Business method: Update connector details
    public void updateDetails(
            String name,
            ConnectorType type,
            ConnectionConfig config,
            List<TableMetadata> registeredTables) {
        
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Connector name cannot be blank");
        }
        
        this.name = name;
        this.type = type;
        this.config = config;
        this.registeredTables = registeredTables;
    }

    // Business method: Activate connector
    public void activate() {
        if (this.status != ConnectorStatus.APPROVED) {
            throw new IllegalStateException("Can only activate approved connectors");
        }
        this.isActive = true;
    }

    // Business method: Deactivate connector
    public void deactivate() {
        this.isActive = false;
    }

    // Business method: Update registered tables
    public void updateRegisteredTables(List<TableMetadata> tables) {
        this.registeredTables = tables;
    }

    // Getter for ID value
    public String getIdValue() {
        return id != null ? id.toString() : null;
    }

    // Getter for type value (for compatibility)
    public String getTypeValue() {
        return type != null ? type.getType() : null;
    }
}
