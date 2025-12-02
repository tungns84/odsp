package com.gs.dsp.dto;

public enum SemanticType {
    // Basic
    TEXT,
    NUMBER,
    BOOLEAN,

    // Time
    DATE,
    DATETIME,
    TIME,
    TIMESTAMP,

    // Financial
    CURRENCY,

    // Geography
    CITY,
    COUNTRY,
    LATITUDE,
    LONGITUDE,

    // Identity
    ID,
    UUID,

    // Web
    URL,
    IMAGE_URL,
    EMAIL,

    // Categorical
    CATEGORY,
    
    // Status
    STATUS,
    
    // Fallback
    UNKNOWN
}
