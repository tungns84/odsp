package com.gs.dsp.dataaccess.domain.model;

import com.gs.dsp.shared.domain.model.ValueObject;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

/**
 * Value Object representing a DataEndpoint's unique identifier.
 * Immutable and validates non-null UUID.
 */
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor
public class DataEndpointId implements ValueObject, Serializable {
    
    private UUID id;
    
    public DataEndpointId(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("DataEndpoint ID cannot be null");
        }
        this.id = id;
    }
    
    /**
     * Generate a new random DataEndpointId
     */
    public static DataEndpointId generate() {
        return new DataEndpointId(UUID.randomUUID());
    }
    
    @Override
    public String toString() {
        return id != null ? id.toString() : null;
    }
}
