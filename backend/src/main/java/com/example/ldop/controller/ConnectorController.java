package com.example.ldop.controller;

import com.example.ldop.config.TenantContext;
import com.example.ldop.constant.FieldNames;
import com.example.ldop.domain.Connector;
import com.example.ldop.repository.ConnectorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import com.example.ldop.security.AuthorizationService;

@RestController
@RequestMapping("/api/v1/connectors")
public class ConnectorController {

    private final ConnectorRepository connectorRepository;
    private final com.example.ldop.service.ConnectorService connectorService;
    private final AuthorizationService authorizationService;

    public ConnectorController(
            ConnectorRepository connectorRepository,
            com.example.ldop.service.ConnectorService connectorService,
            AuthorizationService authorizationService) {
        this.connectorRepository = connectorRepository;
        this.connectorService = connectorService;
        this.authorizationService = authorizationService;
    }

    @GetMapping
    public List<Connector> getAllConnectors() {
        return connectorRepository.findAllByTenantId(TenantContext.getTenantId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Connector> getConnectorById(@PathVariable String id) {
        // SECURITY: Validate UUID format to prevent enumeration
        UUID uuid = authorizationService.validateAndParseUuid(id, "Connector");
        
        return connectorRepository.findByIdAndTenantId(uuid, TenantContext.getTenantId())
                .map(connector -> {
                    // SECURITY: Double-check tenant access (defense in depth)
                    authorizationService.validateTenantAccess(connector.getTenantId(), "Connector");
                    return ResponseEntity.ok(connector);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Connector createConnector(@RequestBody Connector connector) {
        connector.setTenantId(TenantContext.getTenantId());
        connector.setStatus(com.example.ldop.domain.ConnectorStatus.INIT);
        return connectorRepository.save(connector);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Connector> updateConnector(
            @PathVariable String id,
            @RequestBody Connector connectorDetails) {
        // SECURITY: Validate UUID format
        UUID uuid = authorizationService.validateAndParseUuid(id, "Connector");
        
        return connectorRepository.findByIdAndTenantId(uuid, TenantContext.getTenantId())
                .map(connector -> {
                    // SECURITY: Validate tenant access
                    authorizationService.validateTenantAccess(connector.getTenantId(), "Connector");
                    
                    connector.setName(connectorDetails.getName());
                    connector.setType(connectorDetails.getType());
                    connector.setConfig(connectorDetails.getConfig());
                    connector.setRegisteredTables(connectorDetails.getRegisteredTables());
                    connector.setActive(connectorDetails.isActive());
                    // Status is not updated here
                    return ResponseEntity.ok(connectorRepository.save(connector));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/approval")
    public ResponseEntity<Connector> updateApprovalStatus(
            @PathVariable String id,
            @RequestBody java.util.Map<String, String> statusUpdate) {
        // SECURITY: Validate UUID format
        UUID uuid = authorizationService.validateAndParseUuid(id, "Connector");
        
        return connectorRepository.findByIdAndTenantId(uuid, TenantContext.getTenantId())
                .map(connector -> {
                    // SECURITY: Validate tenant access
                    authorizationService.validateTenantAccess(connector.getTenantId(), "Connector");
                    
                    String statusStr = statusUpdate.get(FieldNames.STATUS);
                    if (statusStr != null) {
                        try {
                            com.example.ldop.domain.ConnectorStatus newStatus = com.example.ldop.domain.ConnectorStatus.valueOf(statusStr);
                            if (newStatus == com.example.ldop.domain.ConnectorStatus.APPROVED || newStatus == com.example.ldop.domain.ConnectorStatus.REJECTED) {
                                connector.setStatus(newStatus);
                                return ResponseEntity.ok(connectorRepository.save(connector));
                            }
                        } catch (IllegalArgumentException e) {
                            // Invalid status
                        }
                    }
                    return ResponseEntity.badRequest().<Connector>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConnector(@PathVariable String id) {
        // SECURITY: Validate UUID format
        UUID uuid = authorizationService.validateAndParseUuid(id, "Connector");
        
        return connectorRepository.findByIdAndTenantId(uuid, TenantContext.getTenantId())
                .map(connector -> {
                    // SECURITY: Validate tenant access
                    authorizationService.validateTenantAccess(connector.getTenantId(), "Connector");
                    
                    connectorRepository.delete(connector);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/test-connection")
    public ResponseEntity<List<com.example.ldop.dto.TableMetadata>> testConnection(@RequestBody java.util.Map<String, Object> config) {
        try {
            List<com.example.ldop.dto.TableMetadata> tables = connectorService.testConnectionAndFetchTables(config);
            return ResponseEntity.ok(tables);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/tables")
    public ResponseEntity<List<com.example.ldop.dto.TableMetadata>> getTables(@PathVariable String id) {
        // SECURITY: Validate UUID format
        UUID uuid = authorizationService.validateAndParseUuid(id, "Connector");
        
        return connectorRepository.findByIdAndTenantId(uuid, TenantContext.getTenantId())
                .map(connector -> {
                    // SECURITY: Validate tenant access
                    authorizationService.validateTenantAccess(connector.getTenantId(), "Connector");
                    
                    try {
                        List<com.example.ldop.dto.TableMetadata> tables = connectorService.fetchTables(connector);
                        return ResponseEntity.ok(tables);
                    } catch (Exception e) {
                        return ResponseEntity.badRequest().<List<com.example.ldop.dto.TableMetadata>>build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
