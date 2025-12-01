package com.example.ldop.dto;

import java.util.Map;

public class ColumnMetadata {
    private String name;
    private String displayName;
    private String dataType;
    private SemanticType semanticType = SemanticType.UNKNOWN;
    private String description;
    private MetadataVisibility visibility = MetadataVisibility.EVERYWHERE;
    private boolean isPrimaryKey;
    private boolean isForeignKey;
    private String foreignKeyTarget;
    private Map<String, Object> formatting;

    public ColumnMetadata() {}

    public ColumnMetadata(String name, String dataType) {
        this.name = name;
        this.dataType = dataType;
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

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public SemanticType getSemanticType() {
        return semanticType;
    }

    public void setSemanticType(SemanticType semanticType) {
        this.semanticType = semanticType;
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

    public boolean isPrimaryKey() {
        return isPrimaryKey;
    }

    public void setPrimaryKey(boolean primaryKey) {
        isPrimaryKey = primaryKey;
    }

    public boolean isForeignKey() {
        return isForeignKey;
    }

    public void setForeignKey(boolean foreignKey) {
        isForeignKey = foreignKey;
    }

    public String getForeignKeyTarget() {
        return foreignKeyTarget;
    }

    public void setForeignKeyTarget(String foreignKeyTarget) {
        this.foreignKeyTarget = foreignKeyTarget;
    }

    public Map<String, Object> getFormatting() {
        return formatting;
    }

    public void setFormatting(Map<String, Object> formatting) {
        this.formatting = formatting;
    }
}
