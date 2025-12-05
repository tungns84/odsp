package com.gs.dsp.dataaccess.domain.model;

import com.gs.dsp.shared.domain.model.ValueObject;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Value Object representing masking configuration for a field.
 * Immutable with validation in constructor.
 */
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor // For JPA
public class MaskingConfig implements ValueObject, Serializable {
    
    public static final String TYPE_FIXED = "FIXED";
    public static final String TYPE_REGEX = "REGEX";
    public static final String TYPE_PARTIAL = "PARTIAL";
    
    private boolean enabled;
    private String type;      // FIXED, REGEX, PARTIAL
    private String pattern;   // Pattern for REGEX or PARTIAL masking
    private String replacement; // Replacement string for FIXED or REGEX
    
    public MaskingConfig(boolean enabled, String type, String pattern, String replacement) {
        this.enabled = enabled;
        this.type = type != null ? type.toUpperCase() : TYPE_FIXED;
        this.pattern = pattern;
        this.replacement = replacement;
        
        // Validate type if enabled
        if (enabled && !isValidType(this.type)) {
            throw new IllegalArgumentException("Invalid masking type: " + type + ". Must be FIXED, REGEX, or PARTIAL");
        }
    }
    
    /**
     * Create a disabled masking config
     */
    public static MaskingConfig disabled() {
        return new MaskingConfig(false, null, null, null);
    }
    
    /**
     * Create a FIXED masking config with default replacement
     */
    public static MaskingConfig fixed(String replacement) {
        return new MaskingConfig(true, TYPE_FIXED, null, replacement != null ? replacement : "*****");
    }
    
    /**
     * Create a REGEX masking config
     */
    public static MaskingConfig regex(String pattern, String replacement) {
        if (pattern == null || pattern.isBlank()) {
            throw new IllegalArgumentException("Pattern cannot be null for REGEX masking");
        }
        return new MaskingConfig(true, TYPE_REGEX, pattern, replacement);
    }
    
    /**
     * Create a PARTIAL masking config
     */
    public static MaskingConfig partial(String pattern) {
        return new MaskingConfig(true, TYPE_PARTIAL, pattern, null);
    }
    
    private boolean isValidType(String type) {
        return TYPE_FIXED.equals(type) || TYPE_REGEX.equals(type) || TYPE_PARTIAL.equals(type);
    }
    
    public boolean isFixed() {
        return TYPE_FIXED.equals(type);
    }
    
    public boolean isRegex() {
        return TYPE_REGEX.equals(type);
    }
    
    public boolean isPartial() {
        return TYPE_PARTIAL.equals(type);
    }
}
