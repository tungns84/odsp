package com.gs.dsp.iam.domain.model;

import com.gs.dsp.shared.domain.model.ValueObject;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor
public class TenantId implements ValueObject, Serializable {
    
    private String id;

    public TenantId(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Tenant ID cannot be blank");
        }
        if (id.length() > 50) {
            throw new IllegalArgumentException("Tenant ID must not exceed 50 characters");
        }
        this.id = id;
    }

    @Override
    public String toString() {
        return id;
    }
}
