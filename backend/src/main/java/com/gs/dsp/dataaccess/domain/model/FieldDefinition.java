package com.gs.dsp.dataaccess.domain.model;

import com.gs.dsp.shared.domain.model.ValueObject;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Value Object representing a field definition with optional masking.
 * Used to define how a field should be exposed in a DataEndpoint.
 */
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor // For JPA
public class FieldDefinition implements ValueObject, Serializable {
    
    private String name;
    private String alias;
    
    @Embedded
    private MaskingConfig masking;
    
    public FieldDefinition(String name, String alias, MaskingConfig masking) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Field name cannot be null or blank");
        }
        this.name = name;
        this.alias = alias;
        this.masking = masking != null ? masking : MaskingConfig.disabled();
    }
    
    /**
     * Create a field definition without masking
     */
    public static FieldDefinition of(String name) {
        return new FieldDefinition(name, null, null);
    }
    
    /**
     * Create a field definition with alias
     */
    public static FieldDefinition of(String name, String alias) {
        return new FieldDefinition(name, alias, null);
    }
    
    /**
     * Create a field definition with masking
     */
    public static FieldDefinition withMasking(String name, MaskingConfig masking) {
        return new FieldDefinition(name, null, masking);
    }
    
    /**
     * Check if this field has masking enabled
     */
    public boolean hasMasking() {
        return masking != null && masking.isEnabled();
    }
    
    /**
     * Get the output name (alias if set, otherwise name)
     */
    public String getOutputName() {
        return alias != null && !alias.isBlank() ? alias : name;
    }
}
