package com.example.ldop.service;

import com.example.ldop.domain.Connector;
import com.example.ldop.util.EncryptionUtil;
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
            Map<String, Object> config = connector.getConfig();

            HikariConfig hikariConfig = new HikariConfig();
            
            // Check if custom URL is provided (e.g., for H2 in tests)
            if (config.containsKey("url")) {
                String jdbcUrl = (String) config.get("url");
                hikariConfig.setJdbcUrl(jdbcUrl);
            } else {
                // Construct JDBC URL for PostgreSQL
                String host = (String) config.get("host");
                Integer port = config.get("port") instanceof Integer ? (Integer) config.get("port") : Integer.parseInt(config.get("port").toString());
                String databaseName = (String) config.get("databaseName");
                
                String jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s", host, port, databaseName);
                hikariConfig.setJdbcUrl(jdbcUrl);
            }

            // Handle username - support both "user" and "username" keys
            String username = config.containsKey("user") ? (String) config.get("user") : (String) config.get("username");
            hikariConfig.setUsername(username);
            
            // Handle password (check for encrypted_password first, then password)
            String password;
            if (config.containsKey("encrypted_password")) {
                password = encryptionUtil.decrypt((String) config.get("encrypted_password"));
            } else {
                password = (String) config.get("password");
            }
            hikariConfig.setPassword(password);
            
            if (config.containsKey("driver_class")) {
                hikariConfig.setDriverClassName((String) config.get("driver_class"));
            }

            hikariConfig.setPoolName("HikariPool-" + connector.getName());
            hikariConfig.setMaximumPoolSize(10); // Default limit

            return new HikariDataSource(hikariConfig);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create DataSource for connector: " + connector.getName(), e);
        }
    }
}
