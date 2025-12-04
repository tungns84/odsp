package com.gs.dsp.connectivity.infrastructure.primary;

import com.gs.dsp.shared.infrastructure.config.TenantContext;
import com.gs.dsp.connectivity.application.service.ConnectorApplicationService;
import com.gs.dsp.connectivity.domain.model.Connector;
import com.gs.dsp.connectivity.infrastructure.primary.dto.ConnectorDetailResponse;
import com.gs.dsp.connectivity.infrastructure.primary.dto.ConnectorSummaryResponse;
import com.gs.dsp.connectivity.infrastructure.primary.dto.TableMetadata;
import com.gs.dsp.connectivity.infrastructure.primary.dto.ViewInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * REST Controller for Connector management.
 * Delegates all operations to ConnectorApplicationService.
 */
@RestController
@RequestMapping("/api/v1/connectors")
@RequiredArgsConstructor
public class ConnectorController {

    private final ConnectorApplicationService applicationService;
    private static final Set<String> SENSITIVE_KEYS = Set.of("password", "secret", "key", "token", "credential");

    @GetMapping
    public List<ConnectorSummaryResponse> getAllConnectors() {
        return applicationService.getAllConnectors(TenantContext.getTenantId())
                .stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConnectorDetailResponse> getConnectorById(@PathVariable String id) {
        return applicationService.getConnectorById(id, TenantContext.getTenantId())
                .map(this::toDetailResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ConnectorDetailResponse createConnector(@RequestBody CreateConnectorRequest request) {
        Connector connector = applicationService.createConnector(
                request.getName(),
                request.getType(),
                request.getConfig(),
                TenantContext.getTenantId()
        );
        return toDetailResponse(connector);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConnectorDetailResponse> updateConnector(
            @PathVariable String id,
            @RequestBody UpdateConnectorRequest request) {
        try {
            Connector updated = applicationService.updateConnector(
                    id,
                    request.getName(),
                    request.getType(),
                    request.getConfig(),
                    request.getRegisteredTables(),
                    request.isActive(),
                    TenantContext.getTenantId()
            );
            return ResponseEntity.ok(toDetailResponse(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/approval")
    public ResponseEntity<ConnectorDetailResponse> updateApprovalStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String status = statusUpdate.get("status");
            Connector updated = applicationService.updateApprovalStatus(
                    id,
                    status,
                    TenantContext.getTenantId()
            );
            return ResponseEntity.ok(toDetailResponse(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConnector(@PathVariable String id) {
        try {
            applicationService.deleteConnector(id, TenantContext.getTenantId());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/test-connection")
    public ResponseEntity<List<TableMetadata>> testConnection(@RequestBody Map<String, Object> config) {
        try {
            List<TableMetadata> tables = applicationService.testConnectionAndFetchTables(config);
            return ResponseEntity.ok(tables);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/test-connection")
    public ResponseEntity<Void> testConnectionById(@PathVariable String id) {
        try {
            applicationService.testConnection(id, TenantContext.getTenantId());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
        // Other exceptions propagate to GlobalExceptionHandler
    }

    @GetMapping("/{id}/tables")
    public ResponseEntity<List<TableMetadata>> getTables(@PathVariable String id) {
        try {
            List<TableMetadata> tables = applicationService.getTables(id, TenantContext.getTenantId());
            return ResponseEntity.ok(tables);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Mappers

    private ConnectorSummaryResponse toSummaryResponse(Connector connector) {
        return ConnectorSummaryResponse.builder()
                .id(connector.getIdValue())
                .name(connector.getName())
                .type(connector.getTypeValue())
                .status(connector.getStatus().name())
                .isActive(connector.isActive())
                .createdAt(connector.getCreatedAt())
                .build();
    }

    private ConnectorDetailResponse toDetailResponse(Connector connector) {
        return ConnectorDetailResponse.builder()
                .id(connector.getIdValue())
                .name(connector.getName())
                .type(connector.getTypeValue())
                .status(connector.getStatus().name())
                .isActive(connector.isActive())
                .createdAt(connector.getCreatedAt())
                .config(sanitizeConfig(connector.getConfig().getConfigMap()))
                // registeredTables are lazy loaded via /api/v1/connectors/{id}/tables
                .registeredTables(null)
                .viewInfo(toViewInfo(connector.getConfig().getConfigMap()))
                .build();
    }

    private ViewInfo toViewInfo(Map<String, Object> config) {
        if (config == null) {
            return null;
        }
        return ViewInfo.builder()
                .host((String) config.get("host"))
                .port(getPort(config.get("port")))
                .schema((String) config.getOrDefault("schema", ""))
                .username((String) config.get("username"))
                .databaseName((String) config.get("databaseName"))
                .build();
    }

    private Integer getPort(Object portObj) {
        if (portObj instanceof Integer) {
            return (Integer) portObj;
        }
        if (portObj instanceof String) {
            try {
                return Integer.parseInt((String) portObj);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private Map<String, Object> sanitizeConfig(Map<String, Object> config) {
        if (config == null) {
            return new HashMap<>();
        }
        Map<String, Object> sanitized = new HashMap<>(config);
        sanitized.replaceAll((key, value) -> {
            if (SENSITIVE_KEYS.stream().anyMatch(sensitive -> key.toLowerCase().contains(sensitive))) {
                return "******";
            }
            return value;
        });
        return sanitized;
    }

    // Request DTOs

    public static class CreateConnectorRequest {
        private String name;
        private String type;
        private Map<String, Object> config;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Map<String, Object> getConfig() { return config; }
        public void setConfig(Map<String, Object> config) { this.config = config; }
    }

    public static class UpdateConnectorRequest {
        private String name;
        private String type;
        private Map<String, Object> config;
        private List<TableMetadata> registeredTables;
        private boolean isActive;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Map<String, Object> getConfig() { return config; }
        public void setConfig(Map<String, Object> config) { this.config = config; }
        public List<TableMetadata> getRegisteredTables() { return registeredTables; }
        public void setRegisteredTables(List<TableMetadata> registeredTables) { this.registeredTables = registeredTables; }
        public boolean isActive() { return isActive; }
        public void setActive(boolean active) { isActive = active; }
    }
}
