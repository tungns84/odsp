package com.gs.dsp.connectivity.domain.model;

import com.gs.dsp.shared.domain.model.ValueObject;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

/**
 * Value Object representing Connector's unique identifier.
 * Strongly-typed ID following DDD principles.
 */
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor  // For JPA
public class ConnectorId implements ValueObject, Serializable {
    
    private UUID id;

    public ConnectorId(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("Connector ID cannot be null");
        }
        this.id = id;
    }

    /**
     * Generate a new random ConnectorId.
     */
    public static ConnectorId generate() {
        return new ConnectorId(UUID.randomUUID());
    }

    /**
     * Create ConnectorId from String representation.
     */
    public static ConnectorId from(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Connector ID string cannot be blank");
        }
        try {
            return new ConnectorId(UUID.fromString(id));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid Connector ID format: " + id, e);
        }
    }

    @Override
    public String toString() {
        return id.toString();
    }
}
