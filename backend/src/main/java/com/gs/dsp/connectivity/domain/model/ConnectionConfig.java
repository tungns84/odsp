package com.gs.dsp.connectivity.domain.model;

import com.gs.dsp.shared.domain.model.ValueObject;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * Value Object encapsulating connection configuration.
 * Provides type-safe access to configuration properties.
 */
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor  // For JPA
public class ConnectionConfig implements ValueObject, Serializable {
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> config;

    public ConnectionConfig(Map<String, Object> config) {
        if (config == null || config.isEmpty()) {
            throw new IllegalArgumentException("Connection config cannot be empty");
        }
        // Defensive copy to ensure immutability
        this.config = new HashMap<>(config);
    }

    /**
     * Get host from config.
     */
    public String getHost() {
        return (String) config.get("host");
    }

    /**
     * Get port from config.
     */
    public Integer getPort() {
        Object port = config.get("port");
        if (port instanceof Integer) {
            return (Integer) port;
        }
        if (port instanceof String) {
            return Integer.parseInt((String) port);
        }
        return null;
    }

    /**
     * Get database name from config.
     */
    public String getDatabaseName() {
        return (String) config.get("databaseName");
    }

    /**
     * Get username from config.
     */
    public String getUsername() {
        return (String) config.get("username");
    }

    /**
     * Get schema from config (defaults to "public").
     */
    public String getSchema() {
        return (String) config.getOrDefault("schema", "public");
    }

    /**
     * Check if config contains a specific key.
     */
    public boolean hasKey(String key) {
        return config.containsKey(key);
    }

    /**
     * Get raw config map (returns defensive copy).
     */
    public Map<String, Object> getConfigMap() {
        return new HashMap<>(config);
    }
}
