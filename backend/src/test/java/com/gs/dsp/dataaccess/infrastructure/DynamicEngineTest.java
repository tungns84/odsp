package com.gs.dsp.dataaccess.infrastructure;

import com.gs.dsp.connectivity.domain.model.*;
import com.gs.dsp.connectivity.domain.repository.ConnectorRepository;
import com.gs.dsp.dataaccess.domain.model.DataEndpoint;
import com.gs.dsp.dataaccess.domain.model.DataEndpointId;
import com.gs.dsp.dataaccess.domain.repository.DataEndpointRepository;
import com.gs.dsp.shared.util.EncryptionUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

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
        Map<String, Object> configMap = Map.of(
            "url", "jdbc:h2:mem:ldop_test",
            "user", "sa",
            "encrypted_password", encryptedPassword,
            "driver_class", "org.h2.Driver"
        );

        Connector connector = Connector.create(
                ConnectorId.generate(),
                "Self H2",
                new ConnectorType("DATABASE"),
                new ConnectionConfig(configMap),
                "tenant-1"
        );
        connector.approve(); // Set status to APPROVED
        connector = connectorRepository.save(connector);

        // 2. Create a DataEndpoint exposing the 'connectors' table
        DataEndpoint endpoint = DataEndpoint.create(
                DataEndpointId.generate(),
                connector,
                "Test Endpoint",
                "my-connectors",
                "tenant-1"
        );
        endpoint.updateQueryConfig("{\"mode\": \"BUILDER\", \"rootTable\": \"connectors\"}");
        endpoint.updateFieldMaskingConfig("[{\"name\": \"id\"}, {\"name\": \"name\"}, {\"name\": \"tenant_id\"}]");
        endpoint = dataEndpointRepository.save(endpoint);

        // 3. Execute Query via API
        mockMvc.perform(get("/api/v1/data/" + endpoint.getId())
                        .header("X-Tenant-ID", "tenant-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("Self H2"))
                .andExpect(jsonPath("$.data[0].tenant_id").value("tenant-1"));
    }

    @Disabled("Field masking functionality not yet implemented - skipping until feature is complete")
    @Test
    void queryDynamicData_ShouldRespectFieldSecurityAndMasking() throws Exception {
        // Setup same as above but only expose 'name' with masking
        String encryptedPassword = encryptionUtil.encrypt("");
        Map<String, Object> configMap = Map.of(
            "url", "jdbc:h2:mem:ldop_test",
            "user", "sa",
            "encrypted_password", encryptedPassword,
            "driver_class", "org.h2.Driver"
        );

        Connector connector = Connector.create(
                ConnectorId.generate(),
                "Self H2 Masked",
                new ConnectorType("DATABASE"),
                new ConnectionConfig(configMap),
                "tenant-1"
        );
        connector.approve();
        connectorRepository.save(connector);

        // Config: Expose 'name' as 'connector_name' and mask it with FIXED replacement
        String fieldConfig = "[" +
                "{\"name\": \"name\", \"alias\": \"connector_name\", \"masking\": {\"enabled\": true, \"type\": \"FIXED\", \"replacement\": \"***MASKED***\"}}" +
                "]";

        DataEndpoint endpoint = DataEndpoint.create(
                DataEndpointId.generate(),
                connector,
                "Masked Endpoint",
                "masked-connectors",
                "tenant-1"
        );
        endpoint.updateQueryConfig("{\"mode\": \"BUILDER\", \"rootTable\": \"connectors\"}");
        endpoint.updateFieldMaskingConfig(fieldConfig);
        dataEndpointRepository.save(endpoint);

        mockMvc.perform(get("/api/v1/data/" + endpoint.getId())
                        .header("X-Tenant-ID", "tenant-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].connector_name").value("***MASKED***"))
                .andExpect(jsonPath("$.data[0].id").doesNotExist()); // ID should not be returned
    }
}
