package com.gs.dsp.dataaccess.infrastructure.secondary.query;

import com.gs.dsp.dataaccess.domain.model.MaskingConfig;
import com.gs.dsp.shared.kernel.constants.AppConstants;
import org.springframework.stereotype.Service;

/**
 * Service responsible for applying masking to field values.
 * Supports FIXED, REGEX, and PARTIAL masking types.
 */
@Service
public class MaskingService {

    /**
     * Apply masking to a value based on the masking configuration.
     *
     * @param value  The original value
     * @param config The masking configuration
     * @return The masked value
     */
    public String applyMasking(String value, MaskingConfig config) {
        if (value == null) {
            return null;
        }
        
        if (config == null || !config.isEnabled()) {
            return value;
        }

        if (config.isFixed()) {
            return applyFixedMasking(value, config);
        } else if (config.isRegex()) {
            return applyRegexMasking(value, config);
        } else if (config.isPartial()) {
            return applyPartialMasking(value, config);
        }
        
        return value;
    }

    private String applyFixedMasking(String value, MaskingConfig config) {
        return config.getReplacement() != null ? config.getReplacement() : "*****";
    }

    private String applyRegexMasking(String value, MaskingConfig config) {
        if (config.getPattern() != null && config.getReplacement() != null) {
            return value.replaceAll(config.getPattern(), config.getReplacement());
        }
        return value;
    }

    private String applyPartialMasking(String value, MaskingConfig config) {
        String pattern = config.getPattern();
        if (pattern == null || pattern.isBlank()) {
            return "*****";
        }

        // Strategy: ShowFirstN, ShowLastN
        // Syntax: ShowFirst4 -> shows first 4 chars, masks rest
        // Syntax: ShowLast4 -> shows last 4 chars, masks rest
        // Syntax: ***@***.com -> preserves @ and .com, masks local part and domain name

        if (pattern.startsWith("ShowFirst")) {
            return applyShowFirstMasking(value, pattern);
        } else if (pattern.startsWith("ShowLast")) {
            return applyShowLastMasking(value, pattern);
        } else if (pattern.contains("@")) {
            return applyEmailMasking(value);
        }

        // Fallback: if pattern is just a string, use it as replacement
        return pattern;
    }

    private String applyShowFirstMasking(String value, String pattern) {
        try {
            int count = Integer.parseInt(pattern.substring(9));
            if (value.length() <= count) {
                return value;
            }
            return value.substring(0, count) + "*".repeat(value.length() - count);
        } catch (NumberFormatException e) {
            return "*****";
        }
    }

    private String applyShowLastMasking(String value, String pattern) {
        try {
            int count = Integer.parseInt(pattern.substring(8));
            if (value.length() <= count) {
                return value;
            }
            return "*".repeat(value.length() - count) + value.substring(value.length() - count);
        } catch (NumberFormatException e) {
            return "*****";
        }
    }

    private String applyEmailMasking(String value) {
        int atIndex = value.indexOf('@');
        if (atIndex > 0) {
            String local = value.substring(0, atIndex);
            String domain = value.substring(atIndex + 1);

            String maskedLocal;
            if (local.length() > 2) {
                maskedLocal = local.substring(0, 1) + "****" + local.substring(local.length() - 1);
            } else {
                maskedLocal = "****";
            }
            return maskedLocal + "@" + domain;
        }
        return "*****";
    }
}
