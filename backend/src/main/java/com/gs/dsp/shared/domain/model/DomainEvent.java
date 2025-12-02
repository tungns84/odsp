package com.gs.dsp.shared.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Interface for Domain Events.
 * Represents something that happened in the domain.
 */
public interface DomainEvent {
    UUID getEventId();
    LocalDateTime getOccurredOn();
    String getEventType();
}
