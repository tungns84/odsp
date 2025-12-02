package com.gs.dsp.shared.domain.model;

import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Transient;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Base class for Aggregate Roots.
 * Supports domain event registration.
 */
@MappedSuperclass
public abstract class AggregateRoot<ID> {

    @Transient
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    /**
     * Registers a domain event to be published when the aggregate is saved.
     * @param event The domain event to register
     */
    protected void registerEvent(DomainEvent event) {
        this.domainEvents.add(event);
    }

    /**
     * Returns an unmodifiable list of registered domain events.
     * @return List of domain events
     */
    public List<DomainEvent> getDomainEvents() {
        return Collections.unmodifiableList(domainEvents);
    }

    /**
     * Clears all registered domain events.
     * Should be called after events are published.
     */
    public void clearDomainEvents() {
        this.domainEvents.clear();
    }
}
