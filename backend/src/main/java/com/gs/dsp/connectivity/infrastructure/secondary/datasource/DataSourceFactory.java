package com.gs.dsp.connectivity.infrastructure.secondary.datasource;

import com.gs.dsp.shared.kernel.constants.AppConstants;
import com.gs.dsp.shared.kernel.constants.ErrorMessages;
import com.gs.dsp.shared.kernel.constants.FieldNames;
import com.gs.dsp.connectivity.domain.model.Connector;
import com.gs.dsp.shared.util.EncryptionUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.util.Map;

@Service
public class DataSourceFactory {

    private final EncryptionUtil encryptionUtil;
    private final ObjectMapper objectMapper;

    public DataSourceFactory(EncryptionUtil encryptionUtil, ObjectMapper objectMapper) {
        this.encryptionUtil = encryptionUtil;
        this.objectMapper = objectMapper;
    }

    public DataSource createDataSource(Connector connector) {
        try {
            Map<String, Object> config = connector.getConfig().getConfigMap();

            HikariConfig hikariConfig = new HikariConfig();
            
            // Check if custom URL is provided (e.g., for H2 in tests)
            if (config.containsKey(FieldNames.CONFIG_URL)) {
                String jdbcUrl = (String) config.get(FieldNames.CONFIG_URL);
                hikariConfig.setJdbcUrl(jdbcUrl);
            } else {
                // Construct JDBC URL for PostgreSQL
                String host = (String) config.get(FieldNames.CONFIG_HOST);
                Integer port = config.get(FieldNames.CONFIG_PORT) instanceof Integer ? (Integer) config.get(FieldNames.CONFIG_PORT) : Integer.parseInt(config.get(FieldNames.CONFIG_PORT).toString());
                String databaseName = (String) config.get(FieldNames.CONFIG_DATABASE_NAME);
                
                String jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s", host, port, databaseName);
                hikariConfig.setJdbcUrl(jdbcUrl);
            }

            // Handle username - support both "user" and "username" keys
            String username = config.containsKey(FieldNames.CONFIG_USER) ? (String) config.get(FieldNames.CONFIG_USER) : (String) config.get(FieldNames.CONFIG_USERNAME);
            hikariConfig.setUsername(username);
            
            // Handle password (check for encrypted_password first, then password)
            String password;
            if (config.containsKey(FieldNames.CONFIG_ENCRYPTED_PASSWORD)) {
                password = encryptionUtil.decrypt((String) config.get(FieldNames.CONFIG_ENCRYPTED_PASSWORD));
            } else {
                password = (String) config.get(FieldNames.CONFIG_PASSWORD);
            }
            hikariConfig.setPassword(password);
            
            if (config.containsKey(FieldNames.CONFIG_DRIVER_CLASS)) {
                hikariConfig.setDriverClassName((String) config.get(FieldNames.CONFIG_DRIVER_CLASS));
            }

            hikariConfig.setPoolName("HikariPool-" + connector.getName());
            hikariConfig.setMaximumPoolSize(AppConstants.DEFAULT_POOL_SIZE); // Default limit

            return new HikariDataSource(hikariConfig);
        } catch (Exception e) {
            throw new RuntimeException(String.format(ErrorMessages.FAILED_TO_CREATE_DATASOURCE, connector.getName()), e);
        }
    }
}
