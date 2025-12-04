package com.gs.dsp.dataaccess.domain.model;

/**
 * Status enum for DataEndpoint lifecycle.
 * 
 * - DRAFT: Endpoint created but not yet activated
 * - ACTIVE: Endpoint is live and queryable
 * - INACTIVE: Endpoint is disabled
 */
public enum DataEndpointStatus {
    DRAFT,
    ACTIVE,
    INACTIVE
}
