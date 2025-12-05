package com.gs.dsp.dataaccess.infrastructure.secondary.query;

import com.gs.dsp.connectivity.domain.model.Connector;
import com.gs.dsp.connectivity.domain.model.ConnectorStatus;
import com.gs.dsp.connectivity.infrastructure.secondary.datasource.DataSourceManager;
import com.gs.dsp.dataaccess.domain.model.DataEndpoint;
import com.gs.dsp.dataaccess.domain.model.DataEndpointId;
import com.gs.dsp.dataaccess.domain.model.QueryDefinition;
import com.gs.dsp.dataaccess.domain.repository.DataEndpointRepository;
import com.gs.dsp.dataaccess.infrastructure.primary.dto.TestQueryResult;
import com.gs.dsp.shared.infrastructure.config.TenantContext;
import com.gs.dsp.shared.kernel.constants.AppConstants;
import com.github.benmanes.caffeine.cache.Cache;
import lombok.RequiredArgsConstructor;
import org.jdbi.v3.core.Jdbi;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;

/**
 * Service responsible for executing dynamic queries against data endpoints.
 * Orchestrates SQL building, query execution, and caching.
 */
@Service
@RequiredArgsConstructor
public class DynamicQueryService {

    private final DataSourceManager dataSourceManager;
    private final DataEndpointRepository dataEndpointRepository;
    private final ObjectMapper objectMapper;
    private final SqlBuilder sqlBuilder;
    private final Cache<String, DataEndpoint> dataEndpointMetadataCache;

    /**
     * Execute a query against a data endpoint with pagination.
     *
     * @param dataEndpointId The data endpoint ID
     * @param page           Page number (0-indexed)
     * @param size           Page size
     * @return List of result rows
     */
    public List<Map<String, Object>> executeQuery(DataEndpointId dataEndpointId, int page, int size) {
        String tenantId = TenantContext.getTenantId();

        // Cache: Get DataEndpoint metadata from cache or DB
        String metadataCacheKey = tenantId + ":" + dataEndpointId.toString();
        DataEndpoint endpoint = dataEndpointMetadataCache.get(metadataCacheKey, key ->
                dataEndpointRepository.findByIdAndTenantId(dataEndpointId, tenantId)
                        .orElseThrow(() -> new IllegalArgumentException("Data Endpoint not found: " + dataEndpointId))
        );

        validateConnectorApproved(endpoint.getConnector());

        DataSource dataSource = dataSourceManager.getDataSource(endpoint.getConnector().getId().getId());
        Jdbi jdbi = Jdbi.create(dataSource);

        try {
            QueryDefinition queryDef = objectMapper.readValue(endpoint.getQueryConfig(), QueryDefinition.class);

            // Get schema from connector config
            String schema = sqlBuilder.getSchemaFromConfig(endpoint.getConnector().getConfig().getConfigMap());

            // Build SQL with schema qualification
            String sql = sqlBuilder.buildSql(queryDef, true, schema);

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
     * Execute a test query without saving a DataEndpoint.
     * Used by the frontend to preview data before creating an endpoint.
     *
     * @param connector The connector to query against
     * @param queryDef  The query definition
     * @return Test query result with SQL and data
     */
    public TestQueryResult executeTestQuery(Connector connector, QueryDefinition queryDef) {
        validateConnectorApproved(connector);

        DataSource dataSource = dataSourceManager.getDataSource(connector.getId().getId());
        Jdbi jdbi = Jdbi.create(dataSource);

        // Force limit for test query
        if (queryDef.getLimit() == null || queryDef.getLimit() > AppConstants.DEFAULT_QUERY_LIMIT) {
            queryDef.setLimit(AppConstants.DEFAULT_PAGE_SIZE);
        }

        // Get schema from connector config
        String schema = sqlBuilder.getSchemaFromConfig(connector.getConfig().getConfigMap());

        // Build SQL with schema qualification
        String sql = sqlBuilder.buildSql(queryDef, false, schema);

        List<Map<String, Object>> results = jdbi.withHandle(handle ->
                handle.createQuery(sql)
                        .mapToMap()
                        .list()
        );

        return new TestQueryResult(sql, results);
    }

    /**
     * Invalidate cache for a specific DataEndpoint.
     * Call this method when DataEndpoint is updated or deleted.
     *
     * @param dataEndpointId The data endpoint ID
     * @param tenantId       The tenant ID
     */
    public void invalidateCache(DataEndpointId dataEndpointId, String tenantId) {
        String metadataCacheKey = tenantId + ":" + dataEndpointId.toString();
        dataEndpointMetadataCache.invalidate(metadataCacheKey);
    }

    private void validateConnectorApproved(Connector connector) {
        if (connector.getStatus() != ConnectorStatus.APPROVED) {
            throw new IllegalStateException("Connector is not approved: " + connector.getName());
        }
    }
}
