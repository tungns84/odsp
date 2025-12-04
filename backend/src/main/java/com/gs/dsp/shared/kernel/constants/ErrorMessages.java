package com.gs.dsp.shared.kernel.constants;

/**
 * Common error messages used across the application
 */
public final class ErrorMessages {

    private ErrorMessages() {
        // Private constructor to prevent instantiation
    }

    // Resource Not Found Messages
    public static final String CONNECTOR_NOT_FOUND = "Connector not found";
    public static final String CONNECTOR_NOT_FOUND_WITH_ID = "Connector not found: %s";
    public static final String TENANT_NOT_FOUND_WITH_ID = "Tenant not found with ID: %s";
    public static final String DATA_ENDPOINT_NOT_FOUND = "Data Endpoint not found: %s";
    public static final String API_KEY_NOT_FOUND = "API key not found";
    public static final String RESOURCE_NOT_FOUND = "%s not found";
    public static final String NOT_FOUND_WITH_ID = "%s not found with ID: %s";

    // Access Denied Messages
    public static final String ACCESS_DENIED_RESOURCE_NOT_FOUND = "Access denied: %s not found";
    public static final String ACCESS_DENIED_TENANT_MISMATCH = "Access denied: tenant mismatch";

    // Validation Messages
    public static final String MISSING_REQUIRED_FIELDS = "Missing required fields";
    public static final String INVALID_UUID_FORMAT = "Invalid UUID format for %s";
    public static final String ALREADY_EXISTS = "%s with ID %s already exists";

    // Execution Failure Messages
    public static final String FAILED_TO_EXECUTE_QUERY = "Failed to execute query for endpoint: %s";
    public static final String FAILED_TO_CREATE_DATASOURCE = "Failed to create DataSource for connector: %s";
    public static final String FAILED_TO_CONNECT = "Failed to connect or fetch tables: %s";
    public static final String FAILED_TO_SERIALIZE = "Failed to serialize %s";
    public static final String FAILED_TO_RETRIEVE = "Failed to retrieve created %s";

    // Query Validation Messages
    public static final String INVALID_SQL_QUERY = "Invalid SQL query";
    public static final String QUERY_VALIDATION_FAILED = "Query validation failed: %s";
    public static final String UNSUPPORTED_QUERY_MODE = "Unsupported query mode: %s";

    // Security and Authorization Messages
    public static final String NO_TENANT_CONTEXT = "No tenant context available";
    public static final String NO_TENANT_ASSOCIATION = "%s has no tenant association";
    public static final String IDOR_ATTEMPT_LOG = "SECURITY: IDOR attempt detected! Tenant %s tried to access %s belonging to tenant %s";
    public static final String ID_NULL_OR_EMPTY = "%s ID cannot be null or empty";
    public static final String INVALID_ID_FORMAT = "Invalid %s ID format";
    public static final String INVALID_UUID_LOG = "SECURITY: Invalid UUID format detected for %s: %s";
    public static final String INVALID_API_KEY = "Invalid API Key";
    public static final String MISSING_HEADERS = "Missing X-Tenant-ID or X-API-Key header";

    // Validation Messages (Extended)
    public static final String IDENTIFIER_NULL = "%s cannot be null or empty";
    public static final String INVALID_IDENTIFIER = "Invalid %s: '%s'. Only alphanumeric characters and underscores are allowed.";
    public static final String RESERVED_KEYWORD = "Invalid %s: '%s' is a reserved SQL keyword";
    public static final String IDENTIFIER_TOO_LONG = "%s is too long (max 128 characters)";
    public static final String SQL_INJECTION_DETECTED = "Potential SQL injection detected in %s";
    public static final String EXCEEDS_MAX_LENGTH = "%s exceeds maximum length";
    public static final String TABLE_NOT_REGISTERED = "Table '%s' is not registered for this connector";
    public static final String COLUMN_NOT_AVAILABLE = "Column '%s' is not available in the selected table";
    public static final String INVALID_ORDER_BY = "Invalid ORDER BY clause format";
    public static final String INVALID_ORDER_DIRECTION = "ORDER BY direction must be ASC or DESC";

    // Encryption Messages
    public static final String ERROR_ENCRYPTING = "Error encrypting value";
    public static final String ERROR_DECRYPTING = "Error decrypting value";
}
