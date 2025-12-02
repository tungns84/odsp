package com.gs.dsp.connectivity.domain.model;

/**
 * Enum representing the lifecycle status of a Connector.
 * 
 * INIT - Newly created, pending approval
 * APPROVED - Approved for use
 * REJECTED - Rejected, cannot be used
 */
public enum ConnectorStatus {
    INIT,
    APPROVED,
    REJECTED
}
