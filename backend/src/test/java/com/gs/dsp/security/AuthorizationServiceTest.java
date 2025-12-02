package com.gs.dsp.security;

import com.gs.dsp.config.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("IDOR Protection Tests")
class AuthorizationServiceTest {

    private AuthorizationService authorizationService;
    private static final String TEST_TENANT = "test-tenant";
    private static final String OTHER_TENANT = "other-tenant";

    @BeforeEach
    void setUp() {
        authorizationService = new AuthorizationService();
        TenantContext.setTenantId(TEST_TENANT);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("Should allow access to own tenant resources")
    void testAllowOwnTenantAccess() {
        assertDoesNotThrow(() -> 
            authorizationService.validateTenantAccess(TEST_TENANT, "Resource"));
    }

    @Test
    @DisplayName("Should block access to other tenant resources")
    void testBlockOtherTenantAccess() {
        SecurityException exception = assertThrows(SecurityException.class,
            () -> authorizationService.validateTenantAccess(OTHER_TENANT, "Resource"));
        
        assertTrue(exception.getMessage().contains("Access denied"));
    }

    @Test
    @DisplayName("Should validate UUID format")
    void testValidUuidParsing() {
        String validUuid = UUID.randomUUID().toString();
        
        UUID result = assertDoesNotThrow(() -> 
            authorizationService.validateAndParseUuid(validUuid, "Resource"));
        
        assertEquals(validUuid, result.toString());
    }

    @Test
    @DisplayName("Should reject invalid UUID format")
    void testInvalidUuidRejection() {
        assertThrows(IllegalArgumentException.class,
            () -> authorizationService.validateAndParseUuid("not-a-uuid", "Resource"));
        
        assertThrows(IllegalArgumentException.class,
            () -> authorizationService.validateAndParseUuid("12345", "Resource"));
        
        assertThrows(IllegalArgumentException.class,
            () -> authorizationService.validateAndParseUuid("", "Resource"));
        
        assertThrows(IllegalArgumentException.class,
            () -> authorizationService.validateAndParseUuid(null, "Resource"));
    }

    @Test
    @DisplayName("Should reject sequential ID enumeration attempts")
    void testSequentialIdEnumeration() {
        // Numeric IDs that might indicate enumeration
        assertThrows(IllegalArgumentException.class,
            () -> authorizationService.validateAndParseUuid("1", "Resource"));
        
        assertThrows(IllegalArgumentException.class,
            () -> authorizationService.validateAndParseUuid("2", "Resource"));
        
        assertThrows(IllegalArgumentException.class,
            () -> authorizationService.validateAndParseUuid("100", "Resource"));
    }

    @Test
    @DisplayName("Should validate connector access")
    void testConnectorAccessValidation() {
        UUID connectorId = UUID.randomUUID();
        
        UUID result = assertDoesNotThrow(() -> 
            authorizationService.validateConnectorAccess(connectorId, TEST_TENANT));
        
        assertEquals(connectorId, result);
        
        // Should block access to other tenant's connector
        assertThrows(SecurityException.class,
            () -> authorizationService.validateConnectorAccess(connectorId, OTHER_TENANT));
    }

    @Test
    @DisplayName("Should validate endpoint access")
    void testEndpointAccessValidation() {
        UUID endpointId = UUID.randomUUID();
        
        UUID result = assertDoesNotThrow(() -> 
            authorizationService.validateEndpointAccess(endpointId, TEST_TENANT));
        
        assertEquals(endpointId, result);
        
        // Should block access to other tenant's endpoint
        assertThrows(SecurityException.class,
            () -> authorizationService.validateEndpointAccess(endpointId, OTHER_TENANT));
    }

    @Test
    @DisplayName("Should handle missing tenant context")
    void testMissingTenantContext() {
        TenantContext.clear();
        
        SecurityException exception = assertThrows(SecurityException.class,
            () -> authorizationService.validateTenantAccess(TEST_TENANT, "Resource"));
        
        assertTrue(exception.getMessage().contains("No tenant context"));
    }

    @Test
    @DisplayName("Should handle null resource tenant ID")
    void testNullResourceTenantId() {
        SecurityException exception = assertThrows(SecurityException.class,
            () -> authorizationService.validateTenantAccess(null, "Resource"));
        
        assertTrue(exception.getMessage().contains("no tenant association"));
    }

    @Test
    @DisplayName("Should validate resource ownership")
    void testResourceOwnershipValidation() {
        String testResource = "test-resource";
        
        String result = assertDoesNotThrow(() -> 
            authorizationService.validateResourceOwnership(testResource, "Resource", TEST_TENANT));
        
        assertEquals(testResource, result);
    }

    @Test
    @DisplayName("Should reject null resources")
    void testNullResourceRejection() {
        assertThrows(SecurityException.class,
            () -> authorizationService.validateResourceOwnership(null, "Resource", TEST_TENANT));
    }

    @Test
    @DisplayName("Should prevent horizontal privilege escalation")
    void testHorizontalPrivilegeEscalationPrevention() {
        // User in TEST_TENANT tries to access OTHER_TENANT resource
        SecurityException exception = assertThrows(SecurityException.class,
            () -> authorizationService.validateTenantAccess(OTHER_TENANT, "Connector"));
        
        // Error message should not reveal the other tenant's ID
        assertTrue(exception.getMessage().contains("Access denied"));
        assertFalse(exception.getMessage().contains(OTHER_TENANT));
    }

    @Test
    @DisplayName("Should handle UUID case sensitivity")
    void testUuidCaseSensitivity() {
        UUID uuid = UUID.randomUUID();
        String upperCase = uuid.toString().toUpperCase();
        String lowerCase = uuid.toString().toLowerCase();
        
        UUID result1 = authorizationService.validateAndParseUuid(upperCase, "Resource");
        UUID result2 = authorizationService.validateAndParseUuid(lowerCase, "Resource");
        
        assertEquals(result1, result2);
    }

    @Test
    @DisplayName("Should validate different resource types")
    void testDifferentResourceTypes() {
        assertDoesNotThrow(() -> 
            authorizationService.validateTenantAccess(TEST_TENANT, "Connector"));
        
        assertDoesNotThrow(() -> 
            authorizationService.validateTenantAccess(TEST_TENANT, "Data Endpoint"));
        
        assertDoesNotThrow(() -> 
            authorizationService.validateTenantAccess(TEST_TENANT, "Custom Resource"));
    }
}
