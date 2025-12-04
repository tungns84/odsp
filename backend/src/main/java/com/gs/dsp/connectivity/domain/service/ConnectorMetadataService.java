package com.gs.dsp.connectivity.domain.service;

import com.gs.dsp.connectivity.domain.model.Connector;
import com.gs.dsp.dto.TableMetadata;

import java.util.List;
import java.util.Map;

/**
 * Domain Service interface for fetching connector metadata.
 * This is a Port in Hexagonal Architecture.
 * Implementation will be in infrastructure layer (Adapter).
 */
public interface ConnectorMetadataService {
    
    /**
     * Test connection and fetch tables from a database configuration.
     */
    List<TableMetadata> testConnectionAndFetchTables(Map<String, Object> config);
    
    /**
     * Fetch tables for an existing connector.
     */
    List<TableMetadata> fetchTables(Connector connector);
}
