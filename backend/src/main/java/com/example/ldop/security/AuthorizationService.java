package com.example.ldop.security;

import com.example.ldop.config.TenantContext;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service to prevent IDOR (Insecure Direct Object Reference) attacks
 * Ensures users can only access resources they own or have permission to access
 */
@Service
public class AuthorizationService {

    /**
     * Validates that a resource belongs to the current tenant
     * Prevents IDOR by checking tenant ownership
     * 
     * @param resourceTenantId The tenant ID of the resource
     * @param resourceType Type of resource (for error messages)
     * @throws SecurityException if tenant mismatch detected
     */
    public void validateTenantAccess(String resourceTenantId, String resourceType) {
        String currentTenantId = TenantContext.getTenantId();
        
        if (currentTenantId == null) {
            throw new SecurityException("No tenant context available");
        }
        
        if (resourceTenantId == null) {
            throw new SecurityException(
                String.format("%s has no tenant association", resourceType)
            );
        }
        
        if (!currentTenantId.equals(resourceTenantId)) {
            // Log potential IDOR attempt
            System.err.println(String.format(
                "SECURITY: IDOR attempt detected! " +
                "Tenant %s tried to access %s belonging to tenant %s",
                currentTenantId, resourceType, resourceTenantId
            ));
            
            throw new SecurityException(
                String.format("Access denied: %s not found", resourceType)
            );
        }
    }

    /**
     * Validates UUID format to prevent enumeration attacks
     * 
     * @param id The ID to validate
     * @param resourceType Type of resource (for error messages)
     * @return Parsed UUID
     * @throws IllegalArgumentException if ID is invalid
     */
    public UUID validateAndParseUuid(String id, String resourceType) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException(
                String.format("%s ID cannot be null or empty", resourceType)
            );
        }

        try {
            return UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            // Log potential enumeration attempt
            System.err.println(String.format(
                "SECURITY: Invalid UUID format detected for %s: %s",
                resourceType, id
            ));
            
            throw new IllegalArgumentException(
                String.format("Invalid %s ID format", resourceType)
            );
        }
    }

    /**
     * Validates connector access for current tenant
     * Combines UUID validation and tenant checking
     * 
     * @param connectorId The connector ID
     * @param tenantId The connector's tenant ID
     * @return Validated UUID
     */
    public UUID validateConnectorAccess(UUID connectorId, String tenantId) {
        validateTenantAccess(tenantId, "Connector");
        return connectorId;
    }

    /**
     * Validates data endpoint access for current tenant
     * 
     * @param endpointId The endpoint ID
     * @param tenantId The endpoint's tenant ID
     * @return Validated UUID
     */
    public UUID validateEndpointAccess(UUID endpointId, String tenantId) {
        validateTenantAccess(tenantId, "Data Endpoint");
        return endpointId;
    }

    /**
     * Checks if current user has admin role
     * (Placeholder for future RBAC implementation)
     * 
     * @return true if user is admin
     */
    public boolean isAdmin() {
        // TODO: Implement after adding authentication
        return false;
    }

    /**
     * Checks if current user can modify a resource
     * (Placeholder for future RBAC implementation)
     * 
     * @param resourceOwnerId The owner ID of the resource
     * @return true if user can modify
     */
    public boolean canModify(String resourceOwnerId) {
        // TODO: Implement after adding user authentication
        // For now, anyone in the same tenant can modify
        String currentTenantId = TenantContext.getTenantId();
        return currentTenantId != null;
    }

    /**
     * Validates that a resource exists and belongs to current tenant
     * This should be called after fetching from repository
     * 
     * @param resource The resource (must have getTenantId() method)
     * @param resourceType Type of resource
     * @param <T> Resource type
     * @return The validated resource
     */
    public <T> T validateResourceOwnership(T resource, String resourceType, String tenantId) {
        if (resource == null) {
            throw new SecurityException(
                String.format("%s not found", resourceType)
            );
        }
        
        validateTenantAccess(tenantId, resourceType);
        return resource;
    }
}
