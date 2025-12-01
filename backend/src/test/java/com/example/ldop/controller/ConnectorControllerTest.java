package com.example.ldop.controller;

import com.example.ldop.domain.Connector;
import com.example.ldop.repository.ConnectorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ConnectorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ConnectorRepository connectorRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        connectorRepository.deleteAll();
    }

    @Test
    void createConnector_ShouldSucceedAndDefaultToInit() throws Exception {
        Connector connector = Connector.builder()
                .name("Test DB")
                .type("DATABASE")
                .config(java.util.Map.of())
                .isActive(true)
                .status(com.example.ldop.domain.ConnectorStatus.APPROVED) // Try to set APPROVED, should be ignored
                .build();

        mockMvc.perform(post("/api/v1/connectors")
                        .header("X-Tenant-ID", "tenant-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(connector)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test DB"))
                .andExpect(jsonPath("$.tenantId").value("tenant-1"))
                .andExpect(jsonPath("$.status").value("INIT"));
    }

    @Test
    void approveConnector_ShouldUpdateStatus() throws Exception {
        Connector connector = Connector.builder()
                .name("To Approve")
                .type("DATABASE")
                .config(java.util.Map.of())
                .isActive(true)
                .tenantId("tenant-1")
                .build();
        connector = connectorRepository.save(connector);

        mockMvc.perform(put("/api/v1/connectors/" + connector.getId() + "/approval")
                        .header("X-Tenant-ID", "tenant-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": \"APPROVED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void getConnectors_ShouldRespectTenantIsolation() throws Exception {
        // Create connector for Tenant 1
        Connector c1 = Connector.builder()
                .name("Tenant 1 DB")
                .type("DATABASE")
                .config(java.util.Map.of())
                .isActive(true)
                .tenantId("tenant-1")
                .build();
        connectorRepository.save(c1);

        // Create connector for Tenant 2
        Connector c2 = Connector.builder()
                .name("Tenant 2 DB")
                .type("DATABASE")
                .config(java.util.Map.of())
                .isActive(true)
                .tenantId("tenant-2")
                .build();
        connectorRepository.save(c2);

        // Query as Tenant 1
        mockMvc.perform(get("/api/v1/connectors")
                        .header("X-Tenant-ID", "tenant-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Tenant 1 DB"));

        // Query as Tenant 2
        mockMvc.perform(get("/api/v1/connectors")
                        .header("X-Tenant-ID", "tenant-2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Tenant 2 DB"));
    }

    @Test
    void missingTenantHeader_ShouldReturn400() throws Exception {
        mockMvc.perform(get("/api/v1/connectors"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createConnectorWithMetadata_ShouldPersistRegisteredTables() throws Exception {
        String connectorJson = """
                {
                    "name": "Test DB with Metadata",
                    "type": "DATABASE",
                    "config": {
                        "host": "localhost",
                        "port": 5432,
                        "databaseName": "testdb",
                        "username": "user",
                        "password": "pass",
                        "schema": "public"
                    },
                    "registeredTables": [
                        {
                            "name": "users",
                            "columns": [
                                {"name": "id", "dataType": "integer"},
                                {"name": "username", "dataType": "character varying"}
                            ]
                        },
                        {
                            "name": "orders",
                            "columns": [
                                {"name": "id", "dataType": "integer"},
                                {"name": "user_id", "dataType": "integer"}
                            ]
                        }
                    ],
                    "isActive": true
                }
                """;

        mockMvc.perform(post("/api/v1/connectors")
                        .header("X-Tenant-ID", "tenant-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(connectorJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test DB with Metadata"))
                .andExpect(jsonPath("$.registeredTables").isArray())
                .andExpect(jsonPath("$.registeredTables.length()").value(2))
                .andExpect(jsonPath("$.registeredTables[0].name").value("users"))
                .andExpect(jsonPath("$.registeredTables[0].columns.length()").value(2))
                .andExpect(jsonPath("$.registeredTables[0].columns[0].name").value("id"))
                .andExpect(jsonPath("$.registeredTables[0].columns[0].dataType").value("integer"));
    }

    @Test
    void updateConnector_ShouldUpdateRegisteredTables() throws Exception {
        // Create initial connector
        Connector connector = Connector.builder()
                .name("Initial DB")
                .type("DATABASE")
                .config(java.util.Map.of("host", "localhost"))
                .isActive(true)
                .tenantId("tenant-1")
                .build();
        connector = connectorRepository.save(connector);

        // Update with metadata
        String updateJson = """
                {
                    "name": "Updated DB",
                    "type": "DATABASE",
                    "config": {
                        "host": "localhost"
                    },
                    "registeredTables": [
                        {
                            "name": "products",
                            "columns": [
                                {"name": "id", "dataType": "integer"},
                                {"name": "name", "dataType": "text"}
                            ]
                        }
                    ],
                    "isActive": true
                }
                """;

        mockMvc.perform(put("/api/v1/connectors/" + connector.getId())
                        .header("X-Tenant-ID", "tenant-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated DB"))
                .andExpect(jsonPath("$.registeredTables.length()").value(1))
                .andExpect(jsonPath("$.registeredTables[0].name").value("products"));
    }
}
