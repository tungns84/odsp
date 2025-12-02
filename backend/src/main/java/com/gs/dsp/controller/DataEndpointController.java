package com.gs.dsp.controller;

import com.gs.dsp.config.TenantContext;
import com.gs.dsp.shared.kernel.constants.AppConstants;
import com.gs.dsp.shared.kernel.constants.ErrorMessages;
import com.gs.dsp.shared.kernel.constants.FieldNames;
import com.gs.dsp.connectivity.domain.model.Connector;
import com.gs.dsp.domain.DataEndpoint;
import com.gs.dsp.connectivity.domain.repository.ConnectorRepository;
import com.gs.dsp.repository.DataEndpointRepository;
import com.gs.dsp.service.DynamicQueryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import com.gs.dsp.domain.query.QueryDefinition;
import com.gs.dsp.security.AuthorizationService;

@RestController
@RequestMapping("/api/v1/data-endpoints")
public class DataEndpointController {

    private final DataEndpointRepository dataEndpointRepository;
    private final ConnectorRepository connectorRepository;
    private final DynamicQueryService dynamicQueryService;
    private final AuthorizationService authorizationService;

    public DataEndpointController(
            DataEndpointRepository dataEndpointRepository,
            ConnectorRepository connectorRepository,
            DynamicQueryService dynamicQueryService,
            AuthorizationService authorizationService
    ) {
        this.dataEndpointRepository = dataEndpointRepository;
        this.connectorRepository = connectorRepository;
        this.dynamicQueryService = dynamicQueryService;
        this.authorizationService = authorizationService;
    }

    @GetMapping
    public List<DataEndpoint> getAllEndpoints() {
        return dataEndpointRepository.findAllByTenantId(TenantContext.getTenantId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DataEndpoint> getEndpointById(@PathVariable String id) {
        // SECURITY: Validate UUID format
        UUID uuid = authorizationService.validateAndParseUuid(id, "Data Endpoint");
        
        return dataEndpointRepository.findByIdAndTenantId(uuid, TenantContext.getTenantId())
                .map(endpoint -> {
                    // SECURITY: Validate tenant access
                    authorizationService.validateTenantAccess(endpoint.getTenantId(), "Data Endpoint");
                    return ResponseEntity.ok(endpoint);
                })
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
            Connector connector = connectorRepository.findByIdAndTenantId(connectorId, TenantContext.getTenantId())
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

            UUID connectorId = UUID.fromString(connectorIdStr);
            Connector connector = connectorRepository.findByIdAndTenantId(connectorId, TenantContext.getTenantId())
                    .orElseThrow(() -> new RuntimeException(String.format(ErrorMessages.CONNECTOR_NOT_FOUND_WITH_ID, connectorId)));

            // Serialize queryConfig to JSON string
            ObjectMapper mapper = new ObjectMapper();
            String queryConfigJson = mapper.writeValueAsString(queryConfigMap);

            // Build fieldConfig JSON with masking configuration
            String fieldConfig = null;
            if (maskingConfig != null && !maskingConfig.isEmpty()) {
                try {
                    ObjectMapper objectMapper = new ObjectMapper();
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
                            masking.put(FieldNames.TYPE, AppConstants.MASKING_TYPE_PARTIAL); // Custom type for backend to handle
                            masking.put(FieldNames.PATTERN, config.get(FieldNames.PATTERN));
                        }
                        
                        fieldDef.put("masking", masking);
                        fieldDefinitions.add(fieldDef);
                    }
                    
                    fieldConfig = objectMapper.writeValueAsString(fieldDefinitions);
                } catch (Exception e) {
                    System.err.println("Failed to serialize masking config: " + e.getMessage());
                }
            }

            DataEndpoint endpoint = DataEndpoint.builder()
                    .connector(connector)
                    .name(name)
                    .description(description)
                    .pathAlias(name.toLowerCase().replaceAll("\\s+", "_"))
                    .queryConfig(queryConfigJson)
                    .fieldConfig(fieldConfig)
                    .tenantId(TenantContext.getTenantId())
                    .isPublic(false)
                    .allowedMethods(AppConstants.METHOD_GET)
                    .status(AppConstants.STATUS_ACTIVE)
                    .build();

            DataEndpoint saved = dataEndpointRepository.save(endpoint);
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
        // SECURITY: Validate UUID format
        UUID uuid = authorizationService.validateAndParseUuid(id, "Data Endpoint");
        
        return dataEndpointRepository.findByIdAndTenantId(uuid, TenantContext.getTenantId())
                .map(endpoint -> {
                    // SECURITY: Validate tenant access
                    authorizationService.validateTenantAccess(endpoint.getTenantId(), "Data Endpoint");
                    
                    @SuppressWarnings("unchecked")
                    Map<String, Object> queryConfigMap = (Map<String, Object>) request.get("queryConfig");

                    String name = (String) request.get("name");
                    String description = (String) request.get("description");

                    if (name != null) {
                        endpoint.setName(name);
                        endpoint.setPathAlias(name.toLowerCase().replaceAll("\\s+", "_"));
                    }
                    if (description != null) {
                        endpoint.setDescription(description);
                    }
                    if (queryConfigMap != null) {
                        try {
                            ObjectMapper mapper = new ObjectMapper();
                            endpoint.setQueryConfig(mapper.writeValueAsString(queryConfigMap));
                        } catch (Exception e) {
                            throw new RuntimeException(String.format(ErrorMessages.FAILED_TO_SERIALIZE, FieldNames.QUERY_CONFIG), e);
                        }
                    }

                    return ResponseEntity.ok(dataEndpointRepository.save(endpoint));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DataEndpoint> toggleStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> statusUpdate
    ) {
        return dataEndpointRepository.findByIdAndTenantId(id, TenantContext.getTenantId())
                .map(endpoint -> {
                    String status = statusUpdate.get("status");
                    // For now, we'll use isPublic as a proxy for ACTIVE/INACTIVE
                    if (AppConstants.STATUS_ACTIVE.equals(status)) {
                        endpoint.setPublic(true);
                    } else if (AppConstants.STATUS_INACTIVE.equals(status)) {
                        endpoint.setPublic(false);
                    }
                    return ResponseEntity.ok(dataEndpointRepository.save(endpoint));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEndpoint(@PathVariable String id) {
        // SECURITY: Validate UUID format
        UUID uuid = authorizationService.validateAndParseUuid(id, "Data Endpoint");
        
        return dataEndpointRepository.findByIdAndTenantId(uuid, TenantContext.getTenantId())
                .map(endpoint -> {
                    // SECURITY: Validate tenant access
                    authorizationService.validateTenantAccess(endpoint.getTenantId(), "Data Endpoint");
                    
                    dataEndpointRepository.delete(endpoint);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
