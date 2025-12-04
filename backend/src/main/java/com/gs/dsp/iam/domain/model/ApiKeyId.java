package com.gs.dsp.iam.domain.model;

import com.gs.dsp.shared.domain.model.ValueObject;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor
public class ApiKeyId implements ValueObject, Serializable {

    private UUID id;

    public ApiKeyId(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("ApiKey ID cannot be null");
        }
        this.id = id;
    }

    public ApiKeyId(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("ApiKey ID cannot be null or empty");
        }
        this.id = UUID.fromString(id);
    }

    public static ApiKeyId generate() {
        return new ApiKeyId(UUID.randomUUID());
    }

    @Override
    public String toString() {
        return id.toString();
    }
}
