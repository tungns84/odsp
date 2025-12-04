package com.gs.dsp.connectivity.infrastructure.primary.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ViewInfo {
    private String host;
    private Integer port;
    private String schema;
    private String username;
    private String databaseName;
}
