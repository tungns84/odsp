package com.gs.dsp.dataaccess.infrastructure.secondary.query;

import com.gs.dsp.dataaccess.domain.model.MaskingConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for MaskingService.
 * Covers FIXED, REGEX, and PARTIAL masking types.
 */
class MaskingServiceTest {

    private MaskingService maskingService;

    @BeforeEach
    void setUp() {
        maskingService = new MaskingService();
    }

    @Test
    void testMaskValue_Fixed() {
        MaskingConfig config = new MaskingConfig(true, "FIXED", null, "CONFIDENTIAL");
        String result = maskingService.applyMasking("SecretData", config);
        assertEquals("CONFIDENTIAL", result);
    }

    @Test
    void testMaskValue_Fixed_DefaultReplacement() {
        MaskingConfig config = new MaskingConfig(true, "FIXED", null, null);
        String result = maskingService.applyMasking("SecretData", config);
        assertEquals("*****", result);
    }

    @Test
    void testMaskValue_Regex() {
        MaskingConfig config = new MaskingConfig(true, "REGEX", "\\d", "*");
        String result = maskingService.applyMasking("123456", config);
        assertEquals("******", result);
    }

    @Test
    void testMaskValue_Partial_ShowFirst() {
        MaskingConfig config = new MaskingConfig(true, "PARTIAL", "ShowFirst3", null);
        String result = maskingService.applyMasking("123456789", config);
        assertEquals("123******", result);
    }

    @Test
    void testMaskValue_Partial_ShowLast() {
        MaskingConfig config = new MaskingConfig(true, "PARTIAL", "ShowLast4", null);
        String result = maskingService.applyMasking("123456789", config);
        assertEquals("*****6789", result);
    }

    @Test
    void testMaskValue_Partial_Email() {
        MaskingConfig config = new MaskingConfig(true, "PARTIAL", "***@***.com", null);
        String result = maskingService.applyMasking("john.doe@example.com", config);
        assertEquals("j****e@example.com", result);
    }

    @Test
    void testMaskValue_Partial_Fallback() {
        MaskingConfig config = new MaskingConfig(true, "PARTIAL", "REDACTED", null);
        String result = maskingService.applyMasking("Sensitive", config);
        assertEquals("REDACTED", result);
    }

    @Test
    void testMaskValue_NullValue() {
        MaskingConfig config = new MaskingConfig(true, "FIXED", null, "MASKED");
        String result = maskingService.applyMasking(null, config);
        assertNull(result);
    }

    @Test
    void testMaskValue_DisabledConfig() {
        MaskingConfig config = MaskingConfig.disabled();
        String result = maskingService.applyMasking("SensitiveData", config);
        assertEquals("SensitiveData", result);
    }

    @Test
    void testMaskValue_NullConfig() {
        String result = maskingService.applyMasking("SensitiveData", null);
        assertEquals("SensitiveData", result);
    }
}
