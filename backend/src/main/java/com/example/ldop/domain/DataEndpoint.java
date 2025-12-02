package com.example.ldop.domain;

import com.example.ldop.constant.AppConstants;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "data_endpoints")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataEndpoint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

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

    @Column(name = "allowed_methods")
    private String allowedMethods = AppConstants.METHOD_GET;

    @Column(name = "is_public")
    private boolean isPublic = false;

    @Column(name = "status")
    private String status = AppConstants.STATUS_ACTIVE; // ACTIVE or INACTIVE

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "field_config", columnDefinition = "text")
    private String fieldConfig; // JSON Array of field definitions

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = AppConstants.STATUS_ACTIVE;
        }
    }
}
