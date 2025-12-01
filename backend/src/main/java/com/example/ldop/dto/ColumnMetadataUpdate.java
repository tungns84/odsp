package com.example.ldop.dto;

import lombok.Data;

import java.util.Map;

/**
 * DTO for updating column metadata within a table
 */
@Data
public class ColumnMetadataUpdate {
    
    /**
     * Column name (required for identification)
     */
    private String name;
    
    /**
     * User-friendly display name
     */
    private String displayName;
    
    /**
     * Column description
     */
    private String description;
    
    /**
     * Semantic type classification
     */
    private SemanticType semanticType;
    
    /**
     * Visibility setting
     */
    private MetadataVisibility visibility;
    
    /**
     * Formatting options (currency, date format, etc.)
     */
    private Map<String, Object> formatting;
}
