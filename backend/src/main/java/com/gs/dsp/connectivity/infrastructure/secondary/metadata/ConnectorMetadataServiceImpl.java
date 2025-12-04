package com.gs.dsp.connectivity.infrastructure.secondary.metadata;

import com.gs.dsp.connectivity.domain.model.Connector;
import com.gs.dsp.connectivity.domain.model.ConnectorId;
import com.gs.dsp.connectivity.domain.model.ConnectorType;
import com.gs.dsp.connectivity.domain.model.ConnectionConfig;
import com.gs.dsp.connectivity.domain.service.ConnectorMetadataService;
import com.gs.dsp.connectivity.domain.service.MetadataInferenceService;
import com.gs.dsp.connectivity.infrastructure.secondary.datasource.DataSourceFactory;
import com.gs.dsp.connectivity.infrastructure.primary.dto.MetadataVisibility;
import com.gs.dsp.connectivity.infrastructure.primary.dto.TableMetadata;
import com.gs.dsp.shared.kernel.constants.FieldNames;
import org.jdbi.v3.core.Jdbi;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Infrastructure implementation of ConnectorMetadataService.
 * Adapter in Hexagonal Architecture.
 */
@Service
public class ConnectorMetadataServiceImpl implements ConnectorMetadataService {

    private final DataSourceFactory dataSourceFactory;
    private final MetadataInferenceService metadataInferenceService;

    public ConnectorMetadataServiceImpl(DataSourceFactory dataSourceFactory, 
                                       MetadataInferenceService metadataInferenceService) {
        this.dataSourceFactory = dataSourceFactory;
        this.metadataInferenceService = metadataInferenceService;
    }

    @Override
    public List<TableMetadata> fetchTables(Connector connector) {
        return testConnectionAndFetchTables(connector);
    }

    @Override
    public List<TableMetadata> testConnectionAndFetchTables(Connector connector) {
        DataSource dataSource = dataSourceFactory.createDataSource(connector);
        String schema = (String) connector.getConfig().getConfigMap()
                .getOrDefault(FieldNames.SCHEMA, FieldNames.DEFAULT_SCHEMA);
        
        return fetchTablesWithDataSource(dataSource, schema);
    }

    @Override
    public List<TableMetadata> testConnectionAndFetchTables(Map<String, Object> config) {
        // Create a transient connector object for new connector creation
        Connector tempConnector = Connector.create(
                ConnectorId.generate(),
                "Test Connection",
                ConnectorType.database(),
                new ConnectionConfig(config),
                "mockup-tenant"
        );

        return testConnectionAndFetchTables(tempConnector);
    }

    private List<TableMetadata> fetchTablesWithDataSource(DataSource dataSource, String schema) {
        Jdbi jdbi = Jdbi.create(dataSource);

        try {
            return fetchTablesFromDatabase(jdbi, schema);
        } catch (Exception e) {
            throw new RuntimeException("Failed to connect or fetch tables: " + e.getMessage(), e);
        } finally {
            // Close datasource if it's a HikariDataSource to prevent leak
            if (dataSource instanceof com.zaxxer.hikari.HikariDataSource) {
                ((com.zaxxer.hikari.HikariDataSource) dataSource).close();
            }
        }
    }

    private List<TableMetadata> fetchTablesFromDatabase(Jdbi jdbi, String schema) {
        // Enhanced SQL to  fetch tables, columns, primary keys, and foreign keys
        String sql = "SELECT " +
                     "    c.table_name, " +
                     "    c.column_name, " +
                     "    c.data_type, " +
                     "    CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key, " +
                     "    fk.foreign_table_name as fk_target_table, " +
                     "    fk.foreign_column_name as fk_target_column " +
                     "FROM information_schema.columns c " +
                     "LEFT JOIN ( " +
                     "    SELECT ku.table_name, ku.column_name " +
                     "    FROM information_schema.table_constraints tc " +
                     "    JOIN information_schema.key_column_usage ku " +
                     "        ON tc.constraint_name = ku.constraint_name " +
                     "        AND tc.table_schema = ku.table_schema " +
                     "    WHERE tc.constraint_type = 'PRIMARY KEY' " +
                     "        AND tc.table_schema = :schema " +
                     ") pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name " +
                     "LEFT JOIN ( " +
                     "    SELECT " +
                     "        kcu.table_name, " +
                     "        kcu.column_name, " +
                     "        ccu.table_name AS foreign_table_name, " +
                     "        ccu.column_name AS foreign_column_name " +
                     "    FROM information_schema.table_constraints AS tc " +
                     "    JOIN information_schema.key_column_usage AS kcu " +
                     "        ON tc.constraint_name = kcu.constraint_name " +
                     "        AND tc.table_schema = kcu.table_schema " +
                     "    JOIN information_schema.constraint_column_usage AS ccu " +
                     "        ON ccu.constraint_name = tc.constraint_name " +
                     "        AND ccu.table_schema = tc.table_schema " +
                     "    WHERE tc.constraint_type = 'FOREIGN KEY' " +
                     "        AND tc.table_schema = :schema " +
                     ") fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name " +
                     "WHERE c.table_schema = :schema " +
                     "ORDER BY c.table_name, c.ordinal_position";

        return jdbi.withHandle(handle -> {
            List<Map<String, Object>> rows = handle.createQuery(sql)
                    .bind(FieldNames.SCHEMA, schema)
                    .mapToMap()
                    .list();

            // Group by table name
            Map<String, List<com.gs.dsp.connectivity.infrastructure.primary.dto.ColumnMetadata>> tablesMap = rows.stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                            row -> (String) row.get("table_name"),
                            java.util.stream.Collectors.mapping(
                                    row -> {
                                        String columnName = (String) row.get("column_name");
                                        String dataType = (String) row.get("data_type");
                                        Boolean isPrimaryKey = (Boolean) row.get("is_primary_key");
                                        String fkTargetTable = (String) row.get("fk_target_table");
                                        String fkTargetColumn = (String) row.get("fk_target_column");

                                        // Create and enrich column metadata
                                        com.gs.dsp.connectivity.infrastructure.primary.dto.ColumnMetadata column = new com.gs.dsp.connectivity.infrastructure.primary.dto.ColumnMetadata();
                                        column.setName(columnName);
                                        column.setDataType(dataType);
                                        
                                        // Auto-populate metadata
                                        column.setDisplayName(metadataInferenceService.generateDisplayName(columnName));
                                        column.setSemanticType(metadataInferenceService.inferSemanticType(columnName, dataType));
                                        column.setVisibility(MetadataVisibility.EVERYWHERE);
                                        column.setPrimaryKey(isPrimaryKey != null && isPrimaryKey);
                                        column.setForeignKey(fkTargetTable != null);
                                        if (fkTargetTable != null && fkTargetColumn != null) {
                                            column.setForeignKeyTarget(fkTargetTable + "." + fkTargetColumn);
                                        }
                                        column.setFormatting(metadataInferenceService.inferFormatting(column.getSemanticType()));

                                        return column;
                                    },
                                    java.util.stream.Collectors.toList()
                            )
                    ));

            // Create enriched table metadata
            return tablesMap.entrySet().stream()
                    .map(entry -> {
                        com.gs.dsp.connectivity.infrastructure.primary.dto.TableMetadata table = new com.gs.dsp.connectivity.infrastructure.primary.dto.TableMetadata();
                        table.setName(entry.getKey());
                        table.setDisplayName(metadataInferenceService.generateDisplayName(entry.getKey()));
                        table.setVisibility(MetadataVisibility.VISIBLE);
                        table.setLastSyncedAt(LocalDateTime.now());
                        table.setColumns(entry.getValue());
                        return table;
                    })
                    .collect(java.util.stream.Collectors.toList());
        });
    }
}
