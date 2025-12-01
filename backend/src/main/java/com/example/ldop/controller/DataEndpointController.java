package com.example.ldop.controller;

import com.example.ldop.config.TenantContext;
import com.example.ldop.domain.Connector;
import com.example.ldop.domain.DataEndpoint;
import com.example.ldop.repository.ConnectorRepository;
import com.example.ldop.repository.DataEndpointRepository;
import com.example.ldop.service.DynamicQueryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import com.example.ldop.domain.query.QueryDefinition;
import com.example.ldop.security.AuthorizationService;

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
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
            }

            UUID connectorId = UUID.fromString(connectorIdStr);
            Connector connector = connectorRepository.findByIdAndTenantId(connectorId, TenantContext.getTenantId())
                    .orElseThrow(() -> new RuntimeException("Connector not found"));

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
                    "columns", columns,
                    "rows", rows,
                    "rowCount", rows.size(),
                    "generatedSql", result.getSql()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
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
                    .orElseThrow(() -> new RuntimeException("Connector not found"));

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
                        if ("MASK_ALL".equals(type)) {
                            masking.put("type", "FIXED");
                            masking.put("replacement", "*****");
                        } else if ("PARTIAL".equals(type)) {
                            masking.put("type", "PARTIAL"); // Custom type for backend to handle
                            masking.put("pattern", config.get("pattern"));
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
                    .allowedMethods("GET")
                    .status("ACTIVE")
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
                            throw new RuntimeException("Failed to serialize queryConfig", e);
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
                    if ("ACTIVE".equals(status)) {
                        endpoint.setPublic(true);
                    } else if ("INACTIVE".equals(status)) {
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
