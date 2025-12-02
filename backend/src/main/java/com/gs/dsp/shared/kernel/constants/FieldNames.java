package com.gs.dsp.shared.kernel.constants;

/**
 * Common field names and keys used across the application
 */
public final class FieldNames {

    private FieldNames() {
        // Private constructor to prevent instantiation
    }

    // Request/Response Field Names
    public static final String CONNECTOR_ID = "connectorId";
    public static final String QUERY_CONFIG = "queryConfig";
    public static final String SOURCE_TYPE = "sourceType";
    public static final String SOURCE_CONTENT = "sourceContent";
    public static final String NAME = "name";
    public static final String DESCRIPTION = "description";
    public static final String STATUS = "status";
    public static final String ERROR = "error";
    public static final String MESSAGE = "message";

    // Database Field Names
    public static final String ID = "id";
    public static final String TENANT_ID = "tenantId";
    public static final String CREATED_AT = "createdAt";
    public static final String UPDATED_AT = "updatedAt";

    // Configuration Keys
    public static final String SCHEMA = "schema";
    public static final String DEFAULT_SCHEMA = "public";
    public static final String LIMIT = "limit";
    public static final String PAGE = "page";
    public static final String SIZE = "size";

    // Response Field Names
    public static final String COLUMNS = "columns";
    public static final String ROWS = "rows";
    public static final String ROW_COUNT = "rowCount";
    public static final String GENERATED_SQL = "generatedSql";
    
    // Masking Configuration Keys
    public static final String MASKING_CONFIG = "maskingConfig";
    public static final String ENABLED = "enabled";
    public static final String TYPE = "type";
    public static final String PATTERN = "pattern";
    public static final String REPLACEMENT = "replacement";
    public static final String MASK_ALL = "MASK_ALL";
    public static final String ALLOWED_METHODS = "allowedMethods";
    public static final String IS_PUBLIC = "isPublic";

    // Connection Config Keys
    public static final String CONFIG_URL = "url";
    public static final String CONFIG_HOST = "host";
    public static final String CONFIG_PORT = "port";
    public static final String CONFIG_DATABASE_NAME = "databaseName";
    public static final String CONFIG_USER = "user";
    public static final String CONFIG_USERNAME = "username";
    public static final String CONFIG_PASSWORD = "password";
    public static final String CONFIG_ENCRYPTED_PASSWORD = "encrypted_password";
    public static final String CONFIG_DRIVER_CLASS = "driver_class";
}
