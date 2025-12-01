package com.example.ldop.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Cache configuration for improving query performance
 * Phase 1: Metadata and FieldDefinitions caching
 */
@Configuration
public class CacheConfig {

    /**
     * Cache for DataEndpoint metadata
     * Key format: {tenantId}:{dataEndpointId}
     * TTL: 10 minutes
     * Max size: 1000 entries
     */
    @Bean(name = "dataEndpointMetadataCache")
    public Cache<String, com.example.ldop.domain.DataEndpoint> dataEndpointMetadataCache() {
        return Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .recordStats() // Enable statistics for monitoring
                .build();
    }

    /**
     * Cache for parsed FieldDefinitions
     * Key format: {hash(fieldConfig)}
     * TTL: 1 hour (field configs rarely change)
     * Max size: 500 entries
     */
    @Bean(name = "fieldDefinitionsCache")
    public Cache<String, java.util.List<com.example.ldop.service.DynamicQueryService.FieldDefinition>> fieldDefinitionsCache() {
        return Caffeine.newBuilder()
                .maximumSize(500)
                .expireAfterWrite(1, TimeUnit.HOURS)
                .recordStats()
                .build();
    }
}
