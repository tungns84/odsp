package com.gs.dsp.dataaccess.infrastructure.primary;

import com.gs.dsp.shared.infrastructure.config.TenantContext;
import com.gs.dsp.shared.kernel.constants.AppConstants;
import com.gs.dsp.shared.kernel.constants.ErrorMessages;
import com.gs.dsp.shared.kernel.constants.FieldNames;
import com.gs.dsp.connectivity.domain.model.Connector;
import com.gs.dsp.connectivity.domain.model.ConnectorId;
import com.gs.dsp.dataaccess.domain.model.DataEndpoint;
import com.gs.dsp.dataaccess.domain.model.DataEndpointId;
import com.gs.dsp.dataaccess.application.service.DataEndpointApplicationService;
import com.gs.dsp.connectivity.domain.repository.ConnectorRepository;
import com.gs.dsp.dataaccess.infrastructure.secondary.query.DynamicQueryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import com.gs.dsp.dataaccess.domain.model.QueryDefinition;
import com.gs.dsp.shared.infrastructure.security.AuthorizationService;

@RestController
@RequestMapping("/api/v1/data-endpoints")
public class DataEndpointController {

    private final DataEndpointApplicationService dataEndpointApplicationService;
    private final ConnectorRepository connectorRepository;
    private final DynamicQueryService dynamicQueryService;
    private final AuthorizationService authorizationService;

    public DataEndpointController(
            DataEndpointApplicationService dataEndpointApplicationService,
            ConnectorRepository connectorRepository,
            DynamicQueryService dynamicQueryService,
            AuthorizationService authorizationService
    ) {
        this.dataEndpointApplicationService = dataEndpointApplicationService;
        this.connectorRepository = connectorRepository;
        this.dynamicQueryService = dynamicQueryService;
        this.authorizationService = authorizationService;
    }

    @GetMapping
    public List<DataEndpoint> getAllEndpoints() {
        return dataEndpointApplicationService.getAllEndpoints(TenantContext.getTenantId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DataEndpoint> getEndpointById(@PathVariable String id) {
        return dataEndpointApplicationService.getEndpointById(id, TenantContext.getTenantId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testQuery(@RequestBody Map<String, Object> request) {
        try {
            String connectorIdStr = (String) request.get("connectorId");
            @SuppressWarnings("unchecked")
            Map<String, Object> queryConfigMap = (Map<String, Object>) request.get("queryConfig");

            if (connectorIdStr == null || queryConfigMap == null) {
                return ResponseEntity.badRequest().body(Map.of(FieldNames.ERROR, ErrorMessages.MISSING_REQUIRED_FIELDS));
            }

            UUID connectorId = UUID.fromString(connectorIdStr);

            Connector connector = connectorRepository.findByIdAndTenantId(new ConnectorId(connectorId), TenantContext.getTenantId())
                    .orElseThrow(() -> new RuntimeException(String.format(ErrorMessages.CONNECTOR_NOT_FOUND_WITH_ID, connectorId)));

            // Convert map to QueryDefinition
            ObjectMapper mapper = new ObjectMapper();
            QueryDefinition queryDef = mapper.convertValue(queryConfigMap, QueryDefinition.class);

            // Execute test query
            DynamicQueryService.TestQueryResult result = dynamicQueryService.executeTestQuery(
                    connector,
                    queryDef
            );

            List<Map<String, Object>> rows = result.getResults();

            // Extract column names from first row
            List<String> columns = rows.isEmpty() ? List.of() : List.copyOf(rows.get(0).keySet());

            return ResponseEntity.ok(Map.of(
                    FieldNames.COLUMNS, columns,
                    FieldNames.ROWS, rows,
                    FieldNames.ROW_COUNT, rows.size(),
                    FieldNames.GENERATED_SQL, result.getSql()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(FieldNames.ERROR, e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<DataEndpoint> createEndpoint(@RequestBody Map<String, Object> request) {
        try {
            String name = (String) request.get("name");
            String description = (String) request.get("description");
            String connectorIdStr = (String) request.get("connectorId");
            @SuppressWarnings("unchecked")
            Map<String, Object> queryConfigMap = (Map<String, Object>) request.get("queryConfig");
            @SuppressWarnings("unchecked")
            Map<String, Object> maskingConfig = (Map<String, Object>) request.get("maskingConfig");

            if (name == null || connectorIdStr == null || queryConfigMap == null) {
                return ResponseEntity.badRequest().build();
            }

            // Serialize queryConfig to JSON string
            ObjectMapper mapper = new ObjectMapper();
            String queryConfigJson = mapper.writeValueAsString(queryConfigMap);

            // Build fieldConfig JSON with masking configuration
            String fieldConfig = null;
            if (maskingConfig != null && !maskingConfig.isEmpty()) {
                List<Map<String, Object>> fieldDefinitions = new java.util.ArrayList<>();
                for (Map.Entry<String, Object> entry : maskingConfig.entrySet()) {
                    String columnName = entry.getKey();
                    @SuppressWarnings("unchecked")
                    Map<String, String> config = (Map<String, String>) entry.getValue();
                    
                    Map<String, Object> fieldDef = new HashMap<>();
                    fieldDef.put("name", columnName);
                    
                    Map<String, Object> masking = new HashMap<>();
                    masking.put("enabled", true);
                    
                    String type = config.get("type");
                    if (FieldNames.MASK_ALL.equals(type)) {
                        masking.put(FieldNames.TYPE, AppConstants.MASKING_TYPE_FIXED);
                        masking.put(FieldNames.REPLACEMENT, "*****");
                    } else if (AppConstants.MASKING_TYPE_PARTIAL.equals(type)) {
                        masking.put(FieldNames.TYPE, AppConstants.MASKING_TYPE_PARTIAL);
                        masking.put(FieldNames.PATTERN, config.get(FieldNames.PATTERN));
                    }
                    
                    fieldDef.put("masking", masking);
                    fieldDefinitions.add(fieldDef);
                }
                fieldConfig = mapper.writeValueAsString(fieldDefinitions);
            }

            String pathAlias = name.toLowerCase().replaceAll("\\s+", "_");

            // Delegate to application service
            DataEndpoint saved = dataEndpointApplicationService.createEndpoint(
                connectorIdStr,
                name,
                pathAlias,
                description,
                queryConfigJson,
                fieldConfig,
                TenantContext.getTenantId()
            );

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<DataEndpoint> updateEndpoint(
            @PathVariable String id,
            @RequestBody Map<String, Object> request
    ) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> queryConfigMap = (Map<String, Object>) request.get("queryConfig");
            String name = (String) request.get("name");
            String description = (String) request.get("description");

            String queryConfigJson = null;
            if (queryConfigMap != null) {
                ObjectMapper mapper = new ObjectMapper();
                queryConfigJson = mapper.writeValueAsString(queryConfigMap);
            }

            DataEndpoint updated = dataEndpointApplicationService.updateEndpoint(
                id,
                name,
                description,
                queryConfigJson,
                null, // fieldConfig not updated in this endpoint
                TenantContext.getTenantId()
            );

            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DataEndpoint> toggleStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> statusUpdate
    ) {
        try {
            String status = statusUpdate.get("status");
            DataEndpoint updated;
            
            if (AppConstants.STATUS_ACTIVE.equals(status)) {
                updated = dataEndpointApplicationService.activateEndpoint(id, TenantContext.getTenantId());
            } else if (AppConstants.STATUS_INACTIVE.equals(status)) {
                updated = dataEndpointApplicationService.deactivateEndpoint(id, TenantContext.getTenantId());
            } else {
                return ResponseEntity.badRequest().build();
            }
            
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEndpoint(@PathVariable String id) {
        try {
            dataEndpointApplicationService.deleteEndpoint(id, TenantContext.getTenantId());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
