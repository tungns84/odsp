package com.gs.dsp.connectivity.infrastructure.primary.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ConnectorSummaryResponse {
    private String id;
    private String name;
    private String type;
    private String status;
    private boolean isActive;
    private LocalDateTime createdAt;
}
