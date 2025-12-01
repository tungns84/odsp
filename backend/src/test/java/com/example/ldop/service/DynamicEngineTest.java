package com.example.ldop.service;

import com.example.ldop.domain.Connector;
import com.example.ldop.domain.DataEndpoint;
import com.example.ldop.repository.ConnectorRepository;
import com.example.ldop.repository.DataEndpointRepository;
import com.example.ldop.util.EncryptionUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class DynamicEngineTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ConnectorRepository connectorRepository;

    @Autowired
    private DataEndpointRepository dataEndpointRepository;

    @Autowired
    private EncryptionUtil encryptionUtil;

    @BeforeEach
    void setUp() {
        dataEndpointRepository.deleteAll();
        connectorRepository.deleteAll();
    }

    @Test
    void queryDynamicData_ShouldSucceed() throws Exception {
        // 1. Create a Connector pointing to the H2 test DB itself
        String encryptedPassword = encryptionUtil.encrypt("");
        java.util.Map<String, Object> configMap = java.util.Map.of(
            "url", "jdbc:h2:mem:ldop_test",
            "user", "sa",
            "encrypted_password", encryptedPassword,
            "driver_class", "org.h2.Driver"
        );

        Connector connector = Connector.builder()
                .name("Self H2")
                .type("DATABASE")
                .config(configMap)
                .isActive(true)
                .tenantId("tenant-1")
                .status(com.example.ldop.domain.ConnectorStatus.APPROVED)
                .build();
        connector = connectorRepository.save(connector);

        // 2. Create a DataEndpoint exposing the 'connectors' table
        DataEndpoint endpoint = DataEndpoint.builder()
                .connector(connector)
                .name("Test Endpoint")
                .pathAlias("my-connectors")
                .queryConfig("{\"mode\": \"BUILDER\", \"rootTable\": \"connectors\"}")
                .tenantId("tenant-1")
                .fieldConfig("[{\"name\": \"id\"}, {\"name\": \"name\"}, {\"name\": \"tenant_id\"}]")
                .build();
        endpoint = dataEndpointRepository.save(endpoint);

        // 3. Execute Query via API
        mockMvc.perform(get("/api/v1/data/" + endpoint.getId())
                        .header("X-Tenant-ID", "tenant-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("Self H2"))
                .andExpect(jsonPath("$.data[0].tenant_id").value("tenant-1"));
    }

    @Test
    void queryDynamicData_ShouldRespectFieldSecurityAndMasking() throws Exception {
        // Setup same as above but only expose 'name' with masking
        String encryptedPassword = encryptionUtil.encrypt("");
        java.util.Map<String, Object> configMap = java.util.Map.of(
            "url", "jdbc:h2:mem:ldop_test",
            "user", "sa",
            "encrypted_password", encryptedPassword,
            "driver_class", "org.h2.Driver"
        );

        Connector connector = Connector.builder()
                .name("Self H2 Masked")
                .type("DATABASE")
                .config(configMap)
                .isActive(true)
                .tenantId("tenant-1")
                .status(com.example.ldop.domain.ConnectorStatus.APPROVED)
                .build();
        connectorRepository.save(connector);

        // Config: Expose 'name' as 'connector_name' and mask it with FIXED replacement
        String fieldConfig = "[" +
                "{\"name\": \"name\", \"alias\": \"connector_name\", \"masking\": {\"enabled\": true, \"type\": \"FIXED\", \"replacement\": \"***MASKED***\"}}" +
                "]";

        DataEndpoint endpoint = DataEndpoint.builder()
                .connector(connector)
                .name("Masked Endpoint")
                .pathAlias("masked-connectors")
                .queryConfig("{\"mode\": \"BUILDER\", \"rootTable\": \"connectors\"}")
                .tenantId("tenant-1")
                .fieldConfig(fieldConfig)
                .build();
        dataEndpointRepository.save(endpoint);

        mockMvc.perform(get("/api/v1/data/" + endpoint.getId())
                        .header("X-Tenant-ID", "tenant-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].connector_name").value("***MASKED***"))
                .andExpect(jsonPath("$.data[0].id").doesNotExist()); // ID should not be returned
    }
}
