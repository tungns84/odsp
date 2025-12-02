package com.gs.dsp.dto;

import lombok.Data;

import java.util.List;

/**
 * DTO for updating table metadata
 */
@Data
public class UpdateTableMetadataRequest {
    
    /**
     * User-friendly table display name
     */
    private String displayName;
    
    /**
     * Table description
     */
    private String description;
    
    /**
     * Table visibility setting
     */
    private MetadataVisibility visibility;
    
    /**
     * Column metadata updates (optional)
     * Only specified columns will be updated
     */
    private List<ColumnMetadataUpdate> columns;
}
