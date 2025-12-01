package com.example.ldop.security;

import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.regex.Pattern;

/**
 * Validator service to prevent SQL injection attacks
 * Validates SQL identifiers (table names, column names) and query components
 */
@Service
public class QueryValidator {

    // Whitelist pattern for valid SQL identifiers (alphanumeric + underscore)
    private static final Pattern VALID_IDENTIFIER_PATTERN = Pattern.compile("^[a-zA-Z_][a-zA-Z0-9_]*$");
    
    // SQL keywords that should not appear in identifiers
    private static final Set<String> SQL_KEYWORDS = Set.of(
        "SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER",
        "UNION", "OR", "AND", "WHERE", "FROM", "JOIN", "EXEC", "EXECUTE",
        "SCRIPT", "JAVASCRIPT", "ONCLICK", "ONERROR", "CAST", "CONVERT",
        "DECLARE", "SHUTDOWN", "GRANT", "REVOKE"
    );
    
    // Suspicious patterns that might indicate SQL injection attempts
    private static final Pattern[] INJECTION_PATTERNS = {
        // SQL comment patterns
        Pattern.compile("--|/\\*|\\*/|#", Pattern.CASE_INSENSITIVE),
        // Classic injection: ' OR '1'='1 or 1=1  
        Pattern.compile("(\\bOR\\b|\\bAND\\b)\\s+['\"]?\\w+['\"]?\\s*=\\s*['\"]?\\w+['\"]?", Pattern.CASE_INSENSITIVE),
        // UNION-based injection
        Pattern.compile("\\bUNION\\b.*\\bSELECT\\b", Pattern.CASE_INSENSITIVE),
        // Stacked queries
        Pattern.compile(";\\s*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE)", Pattern.CASE_INSENSITIVE),
        // Stored procedures
        Pattern.compile("\\b(EXEC|EXECUTE|xp_|sp_)\\b", Pattern.CASE_INSENSITIVE),
        // XSS patterns
        Pattern.compile("<script|javascript:|onerror=|onclick=", Pattern.CASE_INSENSITIVE),
        // Time-based blind injection
        Pattern.compile("\\b(SLEEP|WAITFOR|DELAY)\\b\\s*\\(", Pattern.CASE_INSENSITIVE),
        // DROP statements
        Pattern.compile("\\bDROP\\b\\s+(TABLE|DATABASE|SCHEMA)", Pattern.CASE_INSENSITIVE)
    };

    /**
     * Validates that an identifier (table or column name) is safe to use in SQL
     * 
     * @param identifier The identifier to validate
     * @param identifierType Type of identifier (for error messages)
     * @throws IllegalArgumentException if identifier is invalid
     */
    public void validateIdentifier(String identifier, String identifierType) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new IllegalArgumentException(identifierType + " cannot be null or empty");
        }

        String trimmed = identifier.trim();

        // Check against valid pattern
        if (!VALID_IDENTIFIER_PATTERN.matcher(trimmed).matches()) {
            throw new IllegalArgumentException(
                String.format("Invalid %s: '%s'. Only alphanumeric characters and underscores are allowed.", 
                    identifierType, identifier)
            );
        }

        // Check if it's a SQL keyword
        if (SQL_KEYWORDS.contains(trimmed.toUpperCase())) {
            throw new IllegalArgumentException(
                String.format("Invalid %s: '%s' is a reserved SQL keyword", identifierType, identifier)
            );
        }

        // Check max length (prevent DOS via very long names)
        if (trimmed.length() > 128) {
            throw new IllegalArgumentException(
                String.format("%s is too long (max 128 characters)", identifierType)
            );
        }
    }

    /**
     * Validates a table name
     */
    public void validateTableName(String tableName) {
        validateIdentifier(tableName, "Table name");
    }

    /**
     * Validates a column name
     */
    public void validateColumnName(String columnName) {
        validateIdentifier(columnName, "Column name");
    }

    /**
     * Validates a schema name
     */
    public void validateSchemaName(String schemaName) {
        validateIdentifier(schemaName, "Schema name");
    }

    /**
     * Checks if a string contains SQL injection patterns
     * 
     * @param input The input to check
     * @return true if injection patterns are detected
     */
    public boolean containsSqlInjectionPattern(String input) {
        if (input == null) {
            return false;
        }

        for (Pattern pattern : INJECTION_PATTERNS) {
            if (pattern.matcher(input).find()) {
                return true;
            }
        }

        return false;
    }

    /**
     * Validates user input for SQL injection attempts
     * 
     * @param input The user input to validate
     * @param fieldName Name of the field (for error messages)
     * @throws IllegalArgumentException if injection patterns are detected
     */
    public void validateUserInput(String input, String fieldName) {
        if (input == null) {
            return; // Allow null values, validation should be done separately
        }

        if (containsSqlInjectionPattern(input)) {
            throw new IllegalArgumentException(
                String.format("Potential SQL injection detected in %s", fieldName)
            );
        }

        // Check for excessive length (DOS prevention)
        if (input.length() > 10000) {
            throw new IllegalArgumentException(
                String.format("%s exceeds maximum length", fieldName)
            );
        }
    }

    /**
     * Validates that a table name exists in the allowed list for a connector
     * This should be called after connector metadata has been loaded
     * 
     * @param tableName The table name to check
     * @param allowedTables Set of allowed table names
     * @throws IllegalArgumentException if table is not in allowed list
     */
    public void validateTableInWhitelist(String tableName, Set<String> allowedTables) {
        validateTableName(tableName); // First validate the format
        
        if (!allowedTables.contains(tableName)) {
            throw new IllegalArgumentException(
                String.format("Table '%s' is not registered for this connector", tableName)
            );
        }
    }

    /**
     * Validates a column name against a whitelist
     * 
     * @param columnName The column name to check
     * @param allowedColumns Set of allowed column names
     * @throws IllegalArgumentException if column is not in allowed list
     */
    public void validateColumnInWhitelist(String columnName, Set<String> allowedColumns) {
        validateColumnName(columnName); // First validate the format
        
        if (!allowedColumns.contains(columnName)) {
            throw new IllegalArgumentException(
                String.format("Column '%s' is not available in the selected table", columnName)
            );
        }
    }

    /**
     * Sanitizes a user-provided string value for use in SQL
     * Note: This should be used in conjunction with parameterized queries
     * 
     * @param value The value to sanitize
     * @return Sanitized value
     */
    public String sanitizeValue(String value) {
        if (value == null) {
            return null;
        }

        // Remove null bytes
        value = value.replace("\0", "");
        
        // Trim whitespace
        value = value.trim();
        
        return value;
    }

    /**
     * Validates an ORDER BY clause to prevent injection
     * 
     * @param orderByClause The ORDER BY clause
     * @param allowedColumns Set of allowed column names
     * @throws IllegalArgumentException if invalid
     */
    public void validateOrderBy(String orderByClause, Set<String> allowedColumns) {
        if (orderByClause == null || orderByClause.trim().isEmpty()) {
            return;
        }

        String trimmed = orderByClause.trim();
        
        // Parse ORDER BY: column_name [ASC|DESC]
        String[] parts = trimmed.split("\\s+");
        
        if (parts.length == 0 || parts.length > 2) {
            throw new IllegalArgumentException("Invalid ORDER BY clause format");
        }

        // Validate column name
        String columnName = parts[0];
        validateColumnInWhitelist(columnName, allowedColumns);

        // Validate direction if present
        if (parts.length == 2) {
            String direction = parts[1].toUpperCase();
            if (!direction.equals("ASC") && !direction.equals("DESC")) {
                throw new IllegalArgumentException("ORDER BY direction must be ASC or DESC");
            }
        }
    }
}
