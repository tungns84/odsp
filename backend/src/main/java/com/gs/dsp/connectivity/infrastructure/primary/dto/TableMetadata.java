package com.gs.dsp.connectivity.infrastructure.primary.dto;

import java.time.LocalDateTime;
import java.util.List;

public class TableMetadata {
    private String name;
    private String displayName;
    private String description;
    private MetadataVisibility visibility = MetadataVisibility.VISIBLE;
    private LocalDateTime lastSyncedAt;
    private List<ColumnMetadata> columns;

    public TableMetadata() {}

    public TableMetadata(String name, List<ColumnMetadata> columns) {
        this.name = name;
        this.columns = columns;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public MetadataVisibility getVisibility() {
        return visibility;
    }

    public void setVisibility(MetadataVisibility visibility) {
        this.visibility = visibility;
    }

    public LocalDateTime getLastSyncedAt() {
        return lastSyncedAt;
    }

    public void setLastSyncedAt(LocalDateTime lastSyncedAt) {
        this.lastSyncedAt = lastSyncedAt;
    }

    public List<ColumnMetadata> getColumns() {
        return columns;
    }

    public void setColumns(List<ColumnMetadata> columns) {
        this.columns = columns;
    }
}
