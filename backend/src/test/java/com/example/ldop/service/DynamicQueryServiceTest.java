package com.example.ldop.service;

import com.example.ldop.domain.Connector;
import com.example.ldop.domain.ConnectorStatus;
import com.example.ldop.domain.DataEndpoint;
import com.example.ldop.repository.DataEndpointRepository;
import com.example.ldop.service.dialect.DialectFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Method;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DynamicQueryServiceTest {

    @Mock
    private DataSourceManager dataSourceManager;

    @Mock
    private DataEndpointRepository dataEndpointRepository;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private DialectFactory dialectFactory;

    @InjectMocks
    private DynamicQueryService dynamicQueryService;

    @Test
    void testMaskValue_Fixed() throws Exception {
        DynamicQueryService.MaskingConfig config = new DynamicQueryService.MaskingConfig();
        config.setType("FIXED");
        config.setReplacement("CONFIDENTIAL");

        String result = invokeMaskValue("SecretData", config);
        assertEquals("CONFIDENTIAL", result);
    }

    @Test
    void testMaskValue_Regex() throws Exception {
        DynamicQueryService.MaskingConfig config = new DynamicQueryService.MaskingConfig();
        config.setType("REGEX");
        config.setPattern("\\d");
        config.setReplacement("*");

        String result = invokeMaskValue("123456", config);
        assertEquals("******", result);
    }

    @Test
    void testMaskValue_Partial_ShowFirst() throws Exception {
        DynamicQueryService.MaskingConfig config = new DynamicQueryService.MaskingConfig();
        config.setType("PARTIAL");
        config.setPattern("ShowFirst3");

        String result = invokeMaskValue("123456789", config);
        assertEquals("123******", result);
    }

    @Test
    void testMaskValue_Partial_ShowLast() throws Exception {
        DynamicQueryService.MaskingConfig config = new DynamicQueryService.MaskingConfig();
        config.setType("PARTIAL");
        config.setPattern("ShowLast4");

        String result = invokeMaskValue("123456789", config);
        assertEquals("*****6789", result);
    }

    @Test
    void testMaskValue_Partial_Email() throws Exception {
        DynamicQueryService.MaskingConfig config = new DynamicQueryService.MaskingConfig();
        config.setType("PARTIAL");
        config.setPattern("***@***.com");

        String result = invokeMaskValue("john.doe@example.com", config);
        assertEquals("j****e@example.com", result);
    }
    
    @Test
    void testMaskValue_Partial_Fallback() throws Exception {
        DynamicQueryService.MaskingConfig config = new DynamicQueryService.MaskingConfig();
        config.setType("PARTIAL");
        config.setPattern("REDACTED");

        String result = invokeMaskValue("Sensitive", config);
        assertEquals("REDACTED", result);
    }

    // Helper method to access private maskValue method
    private String invokeMaskValue(String value, DynamicQueryService.MaskingConfig config) throws Exception {
        Method method = DynamicQueryService.class.getDeclaredMethod("maskValue", String.class, DynamicQueryService.MaskingConfig.class);
        method.setAccessible(true);
        return (String) method.invoke(dynamicQueryService, value, config);
    }
}
