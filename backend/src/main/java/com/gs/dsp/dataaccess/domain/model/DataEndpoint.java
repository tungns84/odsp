package com.gs.dsp.dataaccess.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gs.dsp.connectivity.domain.model.Connector;
import com.gs.dsp.shared.domain.model.AggregateRoot;
import com.gs.dsp.shared.kernel.constants.AppConstants;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * DataEndpoint Aggregate Root.
 * Represents a queryable data endpoint that exposes data from a Connector.
 */
@Entity
@Table(name = "data_endpoints")
@Getter
@NoArgsConstructor // For JPA
public class DataEndpoint extends AggregateRoot<DataEndpointId> {
    
    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id"))
    private DataEndpointId id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connector_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Connector connector;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "path_alias", unique = true, nullable = false)
    private String pathAlias; // e.g., 'customers' -> /api/data/customers
    
    @Column(name = "query_config", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String queryConfig; // JSON structure of QueryDefinition
    
    @Embedded
    private FieldMaskingConfig fieldMaskingConfig;
    
    @Column(name = "allowed_methods")
    private String allowedMethods = AppConstants.METHOD_GET;
    
    @Column(name = "is_public")
    private boolean isPublic = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DataEndpointStatus status;
    
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // ==================== Factory Method ====================
    
    /**
     * Create a new DataEndpoint in DRAFT status
     */
    public static DataEndpoint create(
            DataEndpointId id,
            Connector connector,
            String name,
            String pathAlias,
            String tenantId) {
        
        DataEndpoint endpoint = new DataEndpoint();
        endpoint.id = id;
        endpoint.connector = connector;
        endpoint.name = name;
        endpoint.pathAlias = pathAlias;
        endpoint.tenantId = tenantId;
        endpoint.status = DataEndpointStatus.DRAFT;
        endpoint.createdAt = LocalDateTime.now();
        endpoint.fieldMaskingConfig = FieldMaskingConfig.empty();
        endpoint.allowedMethods = AppConstants.METHOD_GET;
        endpoint.isPublic = false;
        
        return endpoint;
    }
    
    // ==================== Business Methods ====================
    
    /**
     * Activate the endpoint, making it queryable
     */
    public void activate() {
        if (this.status == DataEndpointStatus.ACTIVE) {
            return; // Idempotent
        }
        this.status = DataEndpointStatus.ACTIVE;
    }
    
    /**
     * Deactivate the endpoint
     */
    public void deactivate() {
        if (this.status == DataEndpointStatus.INACTIVE) {
            return; // Idempotent
        }
        this.status = DataEndpointStatus.INACTIVE;
    }
    
    /**
     * Update the query configuration
     */
    public void updateQueryConfig(String queryConfig) {
        this.queryConfig = queryConfig;
    }
    
    /**
     * Update field masking configuration
     */
    public void updateFieldMaskingConfig(String fieldConfigJson) {
        this.fieldMaskingConfig = new FieldMaskingConfig(fieldConfigJson);
    }
    
    /**
     * Update endpoint details
     */
    public void updateDetails(String name, String description) {
        this.name = name;
        this.description = description;
    }
    
    /**
     * Make endpoint public (accessible via API key)
     */
    public void makePublic() {
        this.isPublic = true;
    }
    
    /**
     * Make endpoint private (tenant-scoped only)
     */
    public void makePrivate() {
        this.isPublic = false;
    }
    
    /**
     * Get the ID value as String
     */
    public String getIdValue() {
        return id != null ? id.toString() : null;
    }
    
    /**
     * Get field config as JSON string for compatibility
     */
    public String getFieldConfig() {
        return fieldMaskingConfig != null ? fieldMaskingConfig.getConfigJson() : null;
    }
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = DataEndpointStatus.DRAFT;
        }
    }
}
