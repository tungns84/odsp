package com.gs.dsp.connectivity.infrastructure.primary.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class ConnectorDetailResponse {
    private String id;
    private String name;
    private String type;
    private String status;
    private boolean isActive;
    private LocalDateTime createdAt;
    private Map<String, Object> config;
    private List<TableMetadata> registeredTables;
    private ViewInfo viewInfo;
}
