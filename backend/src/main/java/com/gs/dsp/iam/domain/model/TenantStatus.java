package com.gs.dsp.iam.domain.model;

public enum TenantStatus {
    ACTIVE,
    INACTIVE;

    public boolean canTransitionTo(TenantStatus newStatus) {
        // Simple logic: can always transition to the other status
        return this != newStatus;
    }
}
