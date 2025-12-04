package com.gs.dsp.connectivity.infrastructure.secondary.datasource;

import com.gs.dsp.connectivity.domain.model.Connector;
import com.gs.dsp.connectivity.domain.repository.ConnectorRepository;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DataSourceManager {

    private final Map<UUID, DataSource> dataSourceCache = new ConcurrentHashMap<>();
    private final ConnectorRepository connectorRepository;
    private final DataSourceFactory dataSourceFactory;

    public DataSourceManager(ConnectorRepository connectorRepository, DataSourceFactory dataSourceFactory) {
        this.connectorRepository = connectorRepository;
        this.dataSourceFactory = dataSourceFactory;
    }

    public DataSource getDataSource(UUID connectorId) {
        return dataSourceCache.computeIfAbsent(connectorId, this::createDataSource);
    }

    private DataSource createDataSource(UUID connectorId) {
        com.gs.dsp.connectivity.domain.model.ConnectorId id = new com.gs.dsp.connectivity.domain.model.ConnectorId(connectorId);
        Connector connector = connectorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Connector not found: " + connectorId));
        
        if (!connector.isActive()) {
            throw new IllegalStateException("Connector is not active: " + connectorId);
        }

        return dataSourceFactory.createDataSource(connector);
    }

    public void invalidate(UUID connectorId) {
        DataSource ds = dataSourceCache.remove(connectorId);
        if (ds instanceof HikariDataSource) {
            ((HikariDataSource) ds).close();
        }
    }
}
