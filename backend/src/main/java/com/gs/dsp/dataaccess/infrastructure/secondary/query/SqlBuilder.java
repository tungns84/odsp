package com.gs.dsp.dataaccess.infrastructure.secondary.query;

import com.gs.dsp.dataaccess.domain.model.QueryDefinition;
import com.gs.dsp.dataaccess.infrastructure.security.QueryValidator;
import com.gs.dsp.shared.kernel.constants.AppConstants;
import com.gs.dsp.shared.kernel.constants.FieldNames;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Component responsible for building SQL queries from QueryDefinition.
 * Handles schema qualification, pagination, and security validation.
 */
@Component
@RequiredArgsConstructor
public class SqlBuilder {

    private final QueryValidator queryValidator;

    /**
     * Build SQL query from QueryDefinition.
     *
     * @param queryDef              The query definition
     * @param usePaginationParams   Whether to use JDBI bind parameters for pagination
     * @param schema                The schema to qualify table names with
     * @return The generated SQL string
     */
    public String buildSql(QueryDefinition queryDef, boolean usePaginationParams, String schema) {
        if (queryDef.getMode() == QueryDefinition.QueryMode.SQL) {
            return buildCustomSql(queryDef, usePaginationParams);
        }
        return buildBuilderModeSql(queryDef, usePaginationParams, schema);
    }

    private String buildCustomSql(QueryDefinition queryDef, boolean usePaginationParams) {
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

    private String buildBuilderModeSql(QueryDefinition queryDef, boolean usePaginationParams, String schema) {
        StringBuilder sql = new StringBuilder("SELECT ");

        // SECURITY: Validate root table name
        queryValidator.validateTableName(queryDef.getRootTable());

        // Columns
        sql.append(buildColumnList(queryDef, schema));

        // From - qualify table name with schema
        String qualifiedRootTable = qualifyTableName(queryDef.getRootTable(), schema);
        sql.append(" FROM ").append(qualifiedRootTable);

        // Joins
        sql.append(buildJoinClause(queryDef, schema));

        // Where
        if (queryDef.getFilters() != null && !queryDef.getFilters().isEmpty()) {
            sql.append(" WHERE ").append(buildWhereClause(queryDef.getFilters()));
        }

        // Order By
        sql.append(buildOrderByClause(queryDef));

        // Limit/Offset
        sql.append(buildPaginationClause(queryDef, usePaginationParams));

        return sql.toString();
    }

    private String buildColumnList(QueryDefinition queryDef, String schema) {
        if (queryDef.getColumns() == null || queryDef.getColumns().isEmpty()) {
            return "*";
        }

        return queryDef.getColumns().stream()
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
    }

    private String buildJoinClause(QueryDefinition queryDef, String schema) {
        if (queryDef.getJoins() == null || queryDef.getJoins().isEmpty()) {
            return "";
        }

        StringBuilder joins = new StringBuilder();
        for (QueryDefinition.JoinDefinition join : queryDef.getJoins()) {
            // SECURITY: Validate join table and join condition
            queryValidator.validateTableName(join.getTable());
            queryValidator.validateUserInput(join.getOn(), "Join condition");

            // Validate join type
            String joinType = join.getType().toUpperCase();
            if (!Set.of(AppConstants.JOIN_INNER, AppConstants.JOIN_LEFT, AppConstants.JOIN_RIGHT, 
                        AppConstants.JOIN_FULL, AppConstants.JOIN_CROSS).contains(joinType)) {
                throw new IllegalArgumentException("Invalid join type: " + join.getType());
            }

            // Qualify join table name with schema
            String qualifiedJoinTable = qualifyTableName(join.getTable(), schema);
            joins.append(" ").append(joinType).append(" JOIN ")
                    .append(qualifiedJoinTable).append(" ON ").append(join.getOn());
        }
        return joins.toString();
    }

    private String buildWhereClause(List<QueryDefinition.FilterCondition> filters) {
        return filters.stream()
                .map(this::buildFilterCondition)
                .collect(Collectors.joining(" AND "));
    }

    private String buildFilterCondition(QueryDefinition.FilterCondition filter) {
        // SECURITY: Validate field name and filter value
        queryValidator.validateColumnName(filter.getField());

        // Convert Object value to String
        String valueStr = filter.getValue() != null ? String.valueOf(filter.getValue()) : "";
        String sanitizedValue = queryValidator.sanitizeValue(valueStr);
        queryValidator.validateUserInput(sanitizedValue, "Filter value");

        String op = filter.getOperator();
        // NOTE: Still using string concatenation here but with validated inputs
        // TODO: Migrate to fully parameterized queries with JDBI bind parameters
        String escapedVal = sanitizedValue.replace("'", "''"); // Escape single quotes
        String val = "'" + escapedVal + "'";

        // Validate operator
        switch (op) {
            case AppConstants.OP_EQ:
                return filter.getField() + " = " + val;
            case AppConstants.OP_NEQ:
                return filter.getField() + " != " + val;
            case AppConstants.OP_GT:
                return filter.getField() + " > " + val;
            case AppConstants.OP_LT:
                return filter.getField() + " < " + val;
            case AppConstants.OP_GTE:
                return filter.getField() + " >= " + val;
            case AppConstants.OP_LTE:
                return filter.getField() + " <= " + val;
            case AppConstants.OP_LIKE:
                return filter.getField() + " LIKE " + val;
            case AppConstants.OP_IN:
                // IN operator needs special handling - validate each value
                queryValidator.validateUserInput(sanitizedValue, "IN clause values");
                return filter.getField() + " IN (" + sanitizedValue + ")";
            default:
                throw new IllegalArgumentException("Unsupported operator: " + op);
        }
    }

    private String buildOrderByClause(QueryDefinition queryDef) {
        if (queryDef.getSort() == null || queryDef.getSort().isEmpty()) {
            return "";
        }

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

        return " ORDER BY " + orderBy;
    }

    private String buildPaginationClause(QueryDefinition queryDef, boolean usePaginationParams) {
        if (usePaginationParams) {
            return " LIMIT :limit OFFSET :offset";
        } else if (queryDef.getLimit() != null) {
            return " LIMIT " + queryDef.getLimit();
        }
        return "";
    }

    /**
     * Qualify a table name with schema prefix.
     * Only adds schema if the table name doesn't already include it.
     */
    public String qualifyTableName(String tableName, String schema) {
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
     * Extract schema from connector configuration.
     * Defaults to 'public' if not specified.
     */
    public String getSchemaFromConfig(Map<String, Object> config) {
        if (config != null && config.containsKey(FieldNames.SCHEMA)) {
            Object schema = config.get(FieldNames.SCHEMA);
            if (schema instanceof String) {
                String schemaStr = ((String) schema).trim();
                return schemaStr.isEmpty() ? FieldNames.DEFAULT_SCHEMA : schemaStr;
            }
        }
        return FieldNames.DEFAULT_SCHEMA; // Default PostgreSQL schema
    }
}
