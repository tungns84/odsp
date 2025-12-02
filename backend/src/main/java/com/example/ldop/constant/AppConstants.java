package com.example.ldop.constant;

/**
 * Application-wide constants
 */
public final class AppConstants {

    private AppConstants() {
        // Private constructor to prevent instantiation
    }

    // Default Values
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final int MAX_PAGE_SIZE = 100;
    public static final int DEFAULT_QUERY_LIMIT = 100;

    // Validation Limits
    public static final int MAX_IDENTIFIER_LENGTH = 128;
    public static final int MAX_INPUT_LENGTH = 10000;
    public static final int MAX_TENANT_ID_LENGTH = 50;
    public static final int MAX_NAME_LENGTH = 255;
    public static final int MAX_PREFIX_LENGTH = 10;
    public static final int MAX_STATUS_LENGTH = 20;

    // Database Connection
    public static final int DEFAULT_POOL_SIZE = 10;

    // Cache Configuration
    public static final int CACHE_TTL_MINUTES = 10;

    // Status Values
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_INACTIVE = "INACTIVE";
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_REVOKED = "REVOKED";
    public static final String STATUS_EXPIRED = "EXPIRED";

    // Query Modes
    public static final String QUERY_MODE_BUILDER = "BUILDER";
    public static final String QUERY_MODE_SQL = "SQL";

    // HTTP Headers
    public static final String HEADER_TENANT_ID = "X-Tenant-ID";
    public static final String HEADER_API_KEY = "X-API-Key";

    // Masking Types
    public static final String MASKING_TYPE_FIXED = "FIXED";
    public static final String MASKING_TYPE_PARTIAL = "PARTIAL";
    public static final String MASKING_TYPE_REGEX = "REGEX";
    public static final String MASKING_TYPE_NONE = "NONE";

    // Allowed Methods
    public static final String METHOD_GET = "GET";
    public static final String METHOD_POST = "POST";
    public static final String METHOD_PUT = "PUT";
    public static final String METHOD_DELETE = "DELETE";
    public static final String METHOD_OPTIONS = "OPTIONS";

    // Join Types
    public static final String JOIN_INNER = "INNER";
    public static final String JOIN_LEFT = "LEFT";
    public static final String JOIN_RIGHT = "RIGHT";
    public static final String JOIN_FULL = "FULL";
    public static final String JOIN_CROSS = "CROSS";

    // Sort Directions
    public static final String SORT_ASC = "ASC";
    public static final String SORT_DESC = "DESC";

    // Filter Operators
    public static final String OP_EQ = "EQ";
    public static final String OP_NEQ = "NEQ";
    public static final String OP_GT = "GT";
    public static final String OP_LT = "LT";
    public static final String OP_GTE = "GTE";
    public static final String OP_LTE = "LTE";
    public static final String OP_LIKE = "LIKE";
    public static final String OP_IN = "IN";
}
