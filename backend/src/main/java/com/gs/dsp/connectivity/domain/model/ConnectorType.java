package com.gs.dsp.connectivity.domain.model;

import com.gs.dsp.shared.domain.model.ValueObject;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Value Object representing Connector type with validation.
 * Replaces simple String type field with type-safe value object.
 */
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor  // For JPA
public class ConnectorType implements ValueObject, Serializable {
    
    public static final String DATABASE = "DATABASE";
    public static final String REST_API = "REST_API";
    
    private String type;

    public ConnectorType(String type) {
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("Connector type cannot be blank");
        }
        if (!DATABASE.equals(type) && !REST_API.equals(type)) {
            throw new IllegalArgumentException(
                "Invalid connector type: " + type + ". Must be DATABASE or REST_API"
            );
        }
        this.type = type;
    }

    /**
     * Factory method for DATABASE type connector.
     */
    public static ConnectorType database() {
        return new ConnectorType(DATABASE);
    }

    /**
     * Factory method for REST_API type connector.
     */
    public static ConnectorType restApi() {
        return new ConnectorType(REST_API);
    }

    public boolean isDatabase() {
        return DATABASE.equals(type);
    }

    public boolean isRestApi() {
        return REST_API.equals(type);
    }

    @Override
    public String toString() {
        return type;
    }
}
