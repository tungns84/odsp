package com.gs.dsp.service;

import com.gs.dsp.dto.ColumnMetadata;
import com.gs.dsp.dto.TableMetadata;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test for ConnectorService using real PostgreSQL database
 * Note: This test requires a running PostgreSQL instance with credentials from application.properties
 */
@SpringBootTest
@ActiveProfiles("default") // Use default profile to connect to real PostgreSQL
public class ConnectorServiceIntegrationTest {

    @Autowired
    private ConnectorService connectorService;

    @Test
    void testConnectionAndFetchTables_ShouldReturnMetadata() {
        // Arrange: Create config using database credentials from application.properties
        Map<String, Object> config = new HashMap<>();
        config.put("host", "localhost");
        config.put("port", 5432);
        config.put("databaseName", "postgres");
        config.put("username", "postgres");
        config.put("password", "admin321");
        config.put("schema", "public");

        // Act: Fetch tables
        List<TableMetadata> tables = connectorService.testConnectionAndFetchTables(config);

        // Assert: Verify tables were fetched
        assertThat(tables).isNotNull();
        assertThat(tables).isNotEmpty();
        
        // Verify structure of first table
        TableMetadata firstTable = tables.get(0);
        assertThat(firstTable.getName()).isNotBlank();
        assertThat(firstTable.getColumns()).isNotEmpty();
        
        // Verify column structure
        ColumnMetadata firstColumn = firstTable.getColumns().get(0);
        assertThat(firstColumn.getName()).isNotBlank();
        assertThat(firstColumn.getDataType()).isNotBlank();

        // Log results for manual inspection
        System.out.println("Found " + tables.size() + " tables:");
        tables.forEach(table -> {
            System.out.println("  - " + table.getName() + " (" + table.getColumns().size() + " columns)");
            table.getColumns().forEach(col -> 
                System.out.println("    * " + col.getName() + ": " + col.getDataType())
            );
        });
    }

    @Test
    void testConnectionAndFetchTables_WithInvalidCredentials_ShouldThrowException() {
        // Arrange: Invalid credentials
        Map<String, Object> config = new HashMap<>();
        config.put("host", "localhost");
        config.put("port", 5432);
        config.put("databaseName", "postgres");
        config.put("username", "invalid_user");
        config.put("password", "invalid_pass");
        config.put("schema", "public");

        // Act & Assert
        try {
            connectorService.testConnectionAndFetchTables(config);
            assert false : "Should have thrown an exception for invalid credentials";
        } catch (RuntimeException e) {
            assertThat(e.getMessage()).contains("Failed to create DataSource");
        }
    }

    @Test
    void testConnectionAndFetchTables_WithDifferentSchema_ShouldRespectSchema() {
        // Arrange: Use information_schema (always available in PostgreSQL)
        Map<String, Object> config = new HashMap<>();
        config.put("host", "localhost");
        config.put("port", 5432);
        config.put("databaseName", "postgres");
        config.put("username", "postgres");
        config.put("password", "admin321");
        config.put("schema", "information_schema");

        // Act
        List<TableMetadata> tables = connectorService.testConnectionAndFetchTables(config);

        // Assert: information_schema should have system catalog tables
        assertThat(tables).isNotNull();
        assertThat(tables).hasSizeGreaterThan(5); // information_schema has many tables
        
        // Verify at least some standard tables exist
        List<String> tableNames = tables.stream()
                .map(TableMetadata::getName)
                .toList();
        assertThat(tableNames).contains("tables", "columns");
    }
}
