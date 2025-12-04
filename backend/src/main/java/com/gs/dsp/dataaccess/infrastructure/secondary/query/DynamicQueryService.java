package com.gs.dsp.dataaccess.infrastructure.secondary.query;

import com.gs.dsp.shared.kernel.constants.AppConstants;
import com.gs.dsp.shared.kernel.constants.FieldNames;
import com.gs.dsp.dataaccess.domain.model.DataEndpoint;
import com.gs.dsp.dataaccess.domain.model.DataEndpointId;
import com.gs.dsp.dataaccess.domain.repository.DataEndpointRepository;
import org.jdbi.v3.core.Jdbi;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.github.benmanes.caffeine.cache.Cache;

import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import com.gs.dsp.dataaccess.domain.model.QueryDefinition;
import com.gs.dsp.dataaccess.infrastructure.security.QueryValidator;
import com.gs.dsp.connectivity.infrastructure.secondary.datasource.DataSourceManager;

@Service
public class DynamicQueryService {

    private final DataSourceManager dataSourceManager;
    private final DataEndpointRepository dataEndpointRepository;
    private final ObjectMapper objectMapper;
    private final Cache<String, DataEndpoint> dataEndpointMetadataCache;
    private final Cache<String, List<FieldDefinition>> fieldDefinitionsCache;
    private final QueryValidator queryValidator;

    public DynamicQueryService(
            DataSourceManager dataSourceManager,
            DataEndpointRepository dataEndpointRepository,
            ObjectMapper objectMapper,
            Cache<String, DataEndpoint> dataEndpointMetadataCache,
            Cache<String, List<FieldDefinition>> fieldDefinitionsCache,
            QueryValidator queryValidator) {
        this.dataSourceManager = dataSourceManager;
        this.dataEndpointRepository = dataEndpointRepository;
        this.objectMapper = objectMapper;
        this.dataEndpointMetadataCache = dataEndpointMetadataCache;
        this.fieldDefinitionsCache = fieldDefinitionsCache;
        this.queryValidator = queryValidator;
    }


    public List<Map<String, Object>> executeQuery(DataEndpointId dataEndpointId, int page, int size) {
        String tenantId = com.gs.dsp.shared.infrastructure.config.TenantContext.getTenantId();

        // Cache: Get DataEndpoint metadata from cache or DB
        String metadataCacheKey = tenantId + ":" + dataEndpointId.toString();
        DataEndpoint endpoint = dataEndpointMetadataCache.get(metadataCacheKey, key ->
            dataEndpointRepository.findByIdAndTenantId(dataEndpointId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Data Endpoint not found: " + dataEndpointId))
        );

        if (endpoint.getConnector().getStatus() != com.gs.dsp.connectivity.domain.model.ConnectorStatus.APPROVED) {
            throw new IllegalStateException("Connector is not approved: " + endpoint.getConnector().getName());
        }

        DataSource dataSource = dataSourceManager.getDataSource(endpoint.getConnector().getId().getId());
        Jdbi jdbi = Jdbi.create(dataSource);

        try {
            QueryDefinition queryDef = objectMapper.readValue(endpoint.getQueryConfig(), QueryDefinition.class);
            
            // Get schema from connector config
            String schema = getSchemaFromConfig(endpoint.getConnector().getConfig().getConfigMap());
            
            // Build SQL with schema qualification
            String sql = buildSql(queryDef, true, schema); 
            
            int offset = page * size;
            
            return jdbi.withHandle(handle -> 
                handle.createQuery(sql)
                    .bind("limit", size)
                    .bind("offset", offset)
                    .mapToMap()
                    .list()
            );
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to execute query for endpoint: " + dataEndpointId, e);
        }
    }

    /**
     * Execute a test query without saving a DataEndpoint
     * Used by the frontend to preview data before creating an endpoint
     */
    public TestQueryResult executeTestQuery(
            com.gs.dsp.connectivity.domain.model.Connector connector,
            QueryDefinition queryDef
    ) {
        if (connector.getStatus() != com.gs.dsp.connectivity.domain.model.ConnectorStatus.APPROVED) {
            throw new IllegalStateException("Connector is not approved: " + connector.getName());
        }

        DataSource dataSource = dataSourceManager.getDataSource(connector.getId().getId());
        Jdbi jdbi = Jdbi.create(dataSource);

        // Force limit for test query
        if (queryDef.getLimit() == null || queryDef.getLimit() > AppConstants.DEFAULT_QUERY_LIMIT) {
            queryDef.setLimit(AppConstants.DEFAULT_PAGE_SIZE);
        }

        // Get schema from connector config
        String schema = getSchemaFromConfig(connector.getConfig().getConfigMap());
        
        // Build SQL with schema qualification
        String sql = buildSql(queryDef, false, schema); 

        List<Map<String, Object>> results = jdbi.withHandle(handle -> 
            handle.createQuery(sql)
                .mapToMap()
                .list()
        );

        return new TestQueryResult(sql, results);
    }

    private String buildSql(QueryDefinition queryDef, boolean usePaginationParams, String schema) {
        if (queryDef.getMode() == QueryDefinition.QueryMode.SQL) {
            String sql = queryDef.getSql().trim();
            
            // SECURITY: Validate custom SQL for injection patterns
            queryValidator.validateUserInput(sql, "Custom SQL query");
            
            if (usePaginationParams) {
                // Wrap in subquery to apply limit/offset safely
                return "SELECT * FROM (" + sql + ") AS subquery LIMIT :limit OFFSET :offset";
            } else {
                // For test query, ensure limit
                if (!sql.toUpperCase().contains("LIMIT")) {
                     return sql + " LIMIT " + (queryDef.getLimit() != null ? queryDef.getLimit() : AppConstants.DEFAULT_PAGE_SIZE);
                }
                return sql;
            }
        }

        // BUILDER MODE
        StringBuilder sql = new StringBuilder("SELECT ");
        
        // SECURITY: Validate root table name
        queryValidator.validateTableName(queryDef.getRootTable());
        
        // Columns
        if (queryDef.getColumns() == null || queryDef.getColumns().isEmpty()) {
            sql.append("*");
        } else {
            String cols = queryDef.getColumns().stream()
                .map(c -> {
                    // SECURITY: Validate each column and table name
                    queryValidator.validateTableName(c.getTable());
                    queryValidator.validateColumnName(c.getName());
                    if (c.getAlias() != null) {
                        queryValidator.validateIdentifier(c.getAlias(), "Column alias");
                    }
                    // Qualify table name with schema
                    String qualifiedTable = qualifyTableName(c.getTable(), schema);
                    return qualifiedTable + "." + c.getName() + (c.getAlias() != null ? " AS " + c.getAlias() : "");
                })
                .collect(Collectors.joining(", "));
            sql.append(cols);
        }

        // From - qualify table name with schema
        String qualifiedRootTable = qualifyTableName(queryDef.getRootTable(), schema);
        sql.append(" FROM ").append(qualifiedRootTable);

        // Joins
        if (queryDef.getJoins() != null) {
            for (QueryDefinition.JoinDefinition join : queryDef.getJoins()) {
                // SECURITY: Validate join table and join condition
                queryValidator.validateTableName(join.getTable());
                queryValidator.validateUserInput(join.getOn(), "Join condition");
                
                // Validate join type
                String joinType = join.getType().toUpperCase();
                if (!Set.of(AppConstants.JOIN_INNER, AppConstants.JOIN_LEFT, AppConstants.JOIN_RIGHT, AppConstants.JOIN_FULL, AppConstants.JOIN_CROSS).contains(joinType)) {
                    throw new IllegalArgumentException("Invalid join type: " + join.getType());
                }
                
                // Qualify join table name with schema
                String qualifiedJoinTable = qualifyTableName(join.getTable(), schema);
                sql.append(" ").append(joinType).append(" JOIN ")
                   .append(qualifiedJoinTable).append(" ON ").append(join.getOn());
            }
        }

        // Where
        if (queryDef.getFilters() != null && !queryDef.getFilters().isEmpty()) {
            sql.append(" WHERE ").append(buildWhereClause(queryDef.getFilters()));
        }

        // Order By
        if (queryDef.getSort() != null && !queryDef.getSort().isEmpty()) {
            String orderBy = queryDef.getSort().stream()
                .map(s -> {
                    // SECURITY: Validate sort field and direction
                    queryValidator.validateColumnName(s.getField());
                    String direction = s.getDirection().toUpperCase();
                    if (!direction.equals(AppConstants.SORT_ASC) && !direction.equals(AppConstants.SORT_DESC)) {
                        throw new IllegalArgumentException("Sort direction must be ASC or DESC");
                    }
                    return s.getField() + " " + direction;
                })
                .collect(Collectors.joining(", "));
            sql.append(" ORDER BY ").append(orderBy);
        }

        // Limit/Offset
        if (usePaginationParams) {
            sql.append(" LIMIT :limit OFFSET :offset");
        } else if (queryDef.getLimit() != null) {
            sql.append(" LIMIT ").append(queryDef.getLimit());
        }

        return sql.toString();
    }

    private String buildWhereClause(List<QueryDefinition.FilterCondition> filters) {
        return filters.stream()
            .map(f -> {
                // SECURITY: Validate field name and filter value
                queryValidator.validateColumnName(f.getField());
                
                // Convert Object value to String
                String valueStr = f.getValue() != null ? String.valueOf(f.getValue()) : "";
                String sanitizedValue = queryValidator.sanitizeValue(valueStr);
                queryValidator.validateUserInput(sanitizedValue, "Filter value");
                
                String op = f.getOperator();
                // NOTE: Still using string concatenation here but with validated inputs
                // TODO: Migrate to fully parameterized queries with JDBI bind parameters
                String escapedVal = sanitizedValue.replace("'", "''"); // Escape single quotes
                String val = "'" + escapedVal + "'";
                
                // Validate operator
                switch (op) {
                    case AppConstants.OP_EQ: return f.getField() + " = " + val;
                    case AppConstants.OP_NEQ: return f.getField() + " != " + val;
                    case AppConstants.OP_GT: return f.getField() + " > " + val;
                    case AppConstants.OP_LT: return f.getField() + " < " + val;
                    case AppConstants.OP_GTE: return f.getField() + " >= " + val;
                    case AppConstants.OP_LTE: return f.getField() + " <= " + val;
                    case AppConstants.OP_LIKE: return f.getField() + " LIKE " + val;
                    case AppConstants.OP_IN: 
                        // IN operator needs special handling - validate each value
                        String inValues = sanitizedValue;
                        queryValidator.validateUserInput(inValues, "IN clause values");
                        return f.getField() + " IN (" + inValues + ")";
                    default:
                        throw new IllegalArgumentException("Unsupported operator: " + op);
                }
            })
            .collect(Collectors.joining(" AND "));
    }

    /**
     * Extract schema from connector configuration
     * Defaults to 'public' if not specified
     */
    private String getSchemaFromConfig(Map<String, Object> config) {
        if (config != null && config.containsKey(FieldNames.SCHEMA)) {
            Object schema = config.get(FieldNames.SCHEMA);
            if (schema instanceof String) {
                String schemaStr = ((String) schema).trim();
                return schemaStr.isEmpty() ? FieldNames.DEFAULT_SCHEMA : schemaStr;
            }
        }
        return FieldNames.DEFAULT_SCHEMA; // Default PostgreSQL schema
    }

    /**
     * Qualify a table name with schema prefix
     * Only adds schema if the table name doesn't already include it
     */
    private String qualifyTableName(String tableName, String schema) {
        if (tableName == null || tableName.isEmpty()) {
            return tableName;
        }
        
        // If table already has schema prefix (contains dot), return as-is
        if (tableName.contains(".")) {
            return tableName;
        }
        
        // Add schema prefix
        if (schema != null && !schema.isEmpty()) {
            return schema + "." + tableName;
        }
        
        return tableName;
    }

    /**
     * Generate SHA-256 hash of a string for cache key
     */
    private String hashString(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            // Fallback to simple hashCode if SHA-256 fails
            return String.valueOf(input.hashCode());
        }
    }

    /**
     * Invalidate cache for a specific DataEndpoint
     * Call this method when DataEndpoint is updated or deleted
     */
    public void invalidateCache(DataEndpointId dataEndpointId, String tenantId) {
        String metadataCacheKey = tenantId + ":" + dataEndpointId.toString();
        dataEndpointMetadataCache.invalidate(metadataCacheKey);
    }

    private String maskValue(String value, MaskingConfig config) {
        if (value == null) return null;
        if (AppConstants.MASKING_TYPE_FIXED.equalsIgnoreCase(config.getType())) {
            return config.getReplacement() != null ? config.getReplacement() : "*****";
        } else if (AppConstants.MASKING_TYPE_REGEX.equalsIgnoreCase(config.getType())) {
            if (config.getPattern() != null && config.getReplacement() != null) {
                return value.replaceAll(config.getPattern(), config.getReplacement());
            }
        } else if (AppConstants.MASKING_TYPE_PARTIAL.equalsIgnoreCase(config.getType())) {
            String pattern = config.getPattern();
            if (pattern == null || pattern.isBlank()) {
                 return "*****";
            }

            // Strategy: ShowFirstN, ShowLastN
            // Syntax: ShowFirst4 -> shows first 4 chars, masks rest
            // Syntax: ShowLast4 -> shows last 4 chars, masks rest
            // Syntax: ***@***.com -> preserves @ and .com, masks local part and domain name (simple heuristic)
            
            if (pattern.startsWith("ShowFirst")) {
                try {
                    int count = Integer.parseInt(pattern.substring(9));
                    if (value.length() <= count) return value;
                    return value.substring(0, count) + "*".repeat(value.length() - count);
                } catch (NumberFormatException e) {
                    // ignore
                }
            } else if (pattern.startsWith("ShowLast")) {
                try {
                    int count = Integer.parseInt(pattern.substring(8));
                    if (value.length() <= count) return value;
                    return "*".repeat(value.length() - count) + value.substring(value.length() - count);
                } catch (NumberFormatException e) {
                    // ignore
                }
            } else if (pattern.contains("@")) {
                // Email masking heuristic
                int atIndex = value.indexOf('@');
                if (atIndex > 0) {
                    String local = value.substring(0, atIndex);
                    String domain = value.substring(atIndex + 1);
                    
                    String maskedLocal = local.length() > 2 ? local.substring(0, 1) + "****" + local.substring(local.length() - 1) : "****";
                    return maskedLocal + "@" + domain;
                }
            }
            
            // Fallback: if pattern is just a string, use it as replacement
            return pattern;
        }
        return value;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldDefinition {
        private String name;
        private String alias;
        private MaskingConfig masking;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaskingConfig {
        private boolean enabled;
        private String type; // REGEX, FIXED
        private String pattern;
        private String replacement;
    }

    @Data
    @AllArgsConstructor
    public static class TestQueryResult {
        private String sql;
        private List<Map<String, Object>> results;
    }
}
