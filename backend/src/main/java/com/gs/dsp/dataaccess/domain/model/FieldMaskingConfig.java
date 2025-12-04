package com.gs.dsp.dataaccess.domain.model;

import com.gs.dsp.shared.domain.model.ValueObject;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Value Object encapsulating field masking configuration.
 * Stores configuration as JSON string.
 */
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor // For JPA
public class FieldMaskingConfig implements ValueObject, Serializable {
    
    @Column(name = "field_config", columnDefinition = "text")
    private String configJson;
    
    public FieldMaskingConfig(String configJson) {
        // Allow null/empty for endpoints without masking
        this.configJson = configJson;
    }
    
    /**
     * Create empty config (no masking)
     */
    public static FieldMaskingConfig empty() {
        return new FieldMaskingConfig("[]");
    }
    
    public boolean isEmpty() {
        return configJson == null || configJson.isBlank() || "[]".equals(configJson);
    }
}
