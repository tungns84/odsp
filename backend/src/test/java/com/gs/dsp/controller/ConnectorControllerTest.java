package com.gs.dsp.controller;

import com.gs.dsp.connectivity.domain.model.*;
import com.gs.dsp.connectivity.domain.repository.ConnectorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

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
        Map<String, Object> request = new HashMap<>();
        request.put("name", "Test DB");
        request.put("type", "DATABASE");
        request.put("config", Map.of());
        request.put("isActive", true);

        mockMvc.perform(post("/api/v1/connectors")
                        .header("X-Tenant-ID", "tenant-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test DB"))
                .andExpect(jsonPath("$.tenantId").value("tenant-1"))
                .andExpect(jsonPath("$.status").value("INIT"));
    }

    @Test
    void approveConnector_ShouldUpdateStatus() throws Exception {
        Connector connector = Connector.create(
                ConnectorId.generate(),
                "To Approve",
                new ConnectorType("DATABASE"),
                new ConnectionConfig(Map.of()),
                "tenant-1"
        );
        connector = connectorRepository.save(connector);

        mockMvc.perform(put("/api/v1/connectors/" + connector.getIdValue() + "/approval")
                        .header("X-Tenant-ID", "tenant-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": \"APPROVED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void getConnectors_ShouldRespectTenantIsolation() throws Exception {
        // Create connector for Tenant 1
        Connector c1 = Connector.create(
                ConnectorId.generate(),
                "Tenant 1 DB",
                new ConnectorType("DATABASE"),
                new ConnectionConfig(Map.of()),
                "tenant-1"
        );
        c1.activate(); // Make it active
        connectorRepository.save(c1);

        // Create connector for Tenant 2
        Connector c2 = Connector.create(
                ConnectorId.generate(),
                "Tenant 2 DB",
                new ConnectorType("DATABASE"),
                new ConnectionConfig(Map.of()),
                "tenant-2"
        );
        c2.activate();
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
    void updateConnector_ShouldUpdateRegisteredTables() throws Exception {
        // Create initial connector
        Connector connector = Connector.create(
                ConnectorId.generate(),
                "Initial DB",
                new ConnectorType("DATABASE"),
                new ConnectionConfig(Map.of("host", "localhost")),
                "tenant-1"
        );
        connector.activate();
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

        mockMvc.perform(put("/api/v1/connectors/" + connector.getIdValue())
                        .header("X-Tenant-ID", "tenant-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated DB"))
                .andExpect(jsonPath("$.registeredTables.length()").value(1))
                .andExpect(jsonPath("$.registeredTables[0].name").value("products"));
    }
}
