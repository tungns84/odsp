package com.gs.dsp.connectivity.infrastructure.secondary.config;

import com.gs.dsp.connectivity.domain.service.MetadataInferenceService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring configuration for Connectivity bounded context domain services.
 * This keeps domain services framework-agnostic while enabling Spring DI.
 */
@Configuration
public class ConnectivityDomainConfig {

    /**
     * Registers the MetadataInferenceService as a Spring bean.
     * The service itself remains a pure POJO without Spring annotations.
     */
    @Bean
    public MetadataInferenceService metadataInferenceService() {
        return new MetadataInferenceService();
    }
}
