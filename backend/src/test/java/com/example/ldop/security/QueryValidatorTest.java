package com.example.ldop.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("SQL Injection Protection Tests")
class QueryValidatorTest {

    private QueryValidator queryValidator;

    @BeforeEach
    void setUp() {
        queryValidator = new QueryValidator();
    }

    @Test
    @DisplayName("Should accept valid table names")
    void testValidTableNames() {
        assertDoesNotThrow(() -> queryValidator.validateTableName("users"));
        assertDoesNotThrow(() -> queryValidator.validateTableName("user_profiles"));
        assertDoesNotThrow(() -> queryValidator.validateTableName("table123"));
        assertDoesNotThrow(() -> queryValidator.validateTableName("_table"));
    }

    @Test
    @DisplayName("Should reject table names with SQL injection attempts")
    void testSqlInjectionInTableName() {
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateTableName("users; DROP TABLE users--"));
        
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateTableName("users' OR '1'='1"));
        
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateTableName("users/*comment*/"));
    }

    @Test
    @DisplayName("Should reject SQL keywords as table names")
    void testSqlKeywordsRejection() {
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateTableName("SELECT"));
        
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateTableName("DROP"));
        
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateTableName("UNION"));
    }

    @Test
    @DisplayName("Should reject table names with special characters")
    void testSpecialCharactersInTableName() {
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateTableName("user@table"));
        
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateTableName("user table"));
        
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateTableName("user-table"));
    }

    @Test
    @DisplayName("Should reject too long table names")
    void testLongTableNames() {
        String longName = "a".repeat(129);
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateTableName(longName));
    }

    @Test
    @DisplayName("Should detect SQL injection patterns")
    void testSqlInjectionPatternDetection() {
        assertTrue(queryValidator.containsSqlInjectionPattern("' OR '1'='1"));
        assertTrue(queryValidator.containsSqlInjectionPattern("1' UNION SELECT * FROM users--"));
        assertTrue(queryValidator.containsSqlInjectionPattern("'; DROP TABLE users--"));
        assertTrue(queryValidator.containsSqlInjectionPattern("1' AND 1=1--"));
        assertTrue(queryValidator.containsSqlInjectionPattern("admin'--"));
    }

    @Test
    @DisplayName("Should not flag safe inputs as injection")
    void testSafeInputsNotFlagged() {
        assertFalse(queryValidator.containsSqlInjectionPattern("John Doe"));
        assertFalse(queryValidator.containsSqlInjectionPattern("test@example.com"));
        assertFalse(queryValidator.containsSqlInjectionPattern("Product Name 123"));
    }

    @Test
    @DisplayName("Should validate column names")
    void testColumnNameValidation() {
        assertDoesNotThrow(() -> queryValidator.validateColumnName("email"));
        assertDoesNotThrow(() -> queryValidator.validateColumnName("user_id"));
        assertDoesNotThrow(() -> queryValidator.validateColumnName("created_at"));
        
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateColumnName("email; DROP TABLE--"));
    }

    @Test
    @DisplayName("Should validate whitelist checking")
    void testWhitelistValidation() {
        Set<String> allowedTables = Set.of("users", "products", "orders");
        
        assertDoesNotThrow(() -> 
            queryValidator.validateTableInWhitelist("users", allowedTables));
        
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateTableInWhitelist("admin_users", allowedTables));
    }

    @Test
    @DisplayName("Should validate ORDER BY clause")
    void testOrderByValidation() {
        Set<String> allowedColumns = Set.of("name", "created_at", "email");
        
        assertDoesNotThrow(() -> 
            queryValidator.validateOrderBy("name ASC", allowedColumns));
        
        assertDoesNotThrow(() -> 
            queryValidator.validateOrderBy("created_at DESC", allowedColumns));
        
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateOrderBy("name; DROP TABLE--", allowedColumns));
        
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateOrderBy("invalid_column ASC", allowedColumns));
    }

    @Test
    @DisplayName("Should sanitize values safely")
    void testValueSanitization() {
        String result = queryValidator.sanitizeValue("  test value  ");
        assertEquals("test value", result);
        
        result = queryValidator.sanitizeValue("test\0value");
        assertFalse(result.contains("\0"));
    }

    @Test
    @DisplayName("Should validate user input for injection patterns")
    void testUserInputValidation() {
        assertDoesNotThrow(() -> 
            queryValidator.validateUserInput("test value", "field"));
        
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateUserInput("' OR '1'='1", "field"));
        
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateUserInput("'; DROP TABLE users--", "field"));
    }

    @Test
    @DisplayName("Should prevent XSS in SQL context")
    void testXssPreventionInSql() {
        assertTrue(queryValidator.containsSqlInjectionPattern("<script>alert('xss')</script>"));
        assertTrue(queryValidator.containsSqlInjectionPattern("javascript:void(0)"));
        assertTrue(queryValidator.containsSqlInjectionPattern("onerror=alert(1)"));
    }

    @Test
    @DisplayName("Should handle null values safely")
    void testNullHandling() {
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateTableName(null));
        
        assertThrows(IllegalArgumentException.class,
            () -> queryValidator.validateTableName(""));
        
        assertDoesNotThrow(() -> 
            queryValidator.validateUserInput(null, "field"));
    }

    @Test
    @DisplayName("Should validate complex injection attempts")
    void testComplexInjectionAttempts() {
        // Stacked queries
        assertTrue(queryValidator.containsSqlInjectionPattern("1'; DELETE FROM users; --"));
        
        // Time-based blind SQL injection
        assertTrue(queryValidator.containsSqlInjectionPattern("1' AND SLEEP(5)--"));
        
        // Boolean-based blind SQL injection
        assertTrue(queryValidator.containsSqlInjectionPattern("1' AND 1=1--"));
        
        // UNION-based injection
        assertTrue(queryValidator.containsSqlInjectionPattern("1' UNION SELECT NULL, NULL--"));
    }
}
