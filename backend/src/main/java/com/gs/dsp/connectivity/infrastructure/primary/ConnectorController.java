package com.gs.dsp.connectivity.infrastructure.primary;

import com.gs.dsp.shared.infrastructure.config.TenantContext;
import com.gs.dsp.connectivity.application.service.ConnectorApplicationService;
import com.gs.dsp.connectivity.domain.model.Connector;
import com.gs.dsp.connectivity.infrastructure.primary.dto.TableMetadata;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Connector management.
 * Delegates all operations to ConnectorApplicationService.
 */
@RestController
@RequestMapping("/api/v1/connectors")
@RequiredArgsConstructor
public class ConnectorController {

    private final ConnectorApplicationService applicationService;

    @GetMapping
    public List<Connector> getAllConnectors() {
        return applicationService.getAllConnectors(TenantContext.getTenantId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Connector> getConnectorById(@PathVariable String id) {
        return applicationService.getConnectorById(id, TenantContext.getTenantId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Connector createConnector(@RequestBody CreateConnectorRequest request) {
        return applicationService.createConnector(
                request.getName(),
                request.getType(),
                request.getConfig(),
                TenantContext.getTenantId()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Connector> updateConnector(
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
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/approval")
    public ResponseEntity<Connector> updateApprovalStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String status = statusUpdate.get("status");
            Connector updated = applicationService.updateApprovalStatus(
                    id,
                    status,
                    TenantContext.getTenantId()
            );
            return ResponseEntity.ok(updated);
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
