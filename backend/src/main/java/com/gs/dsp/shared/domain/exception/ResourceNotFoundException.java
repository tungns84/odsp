package com.gs.dsp.shared.domain.exception;

import lombok.Getter;

@Getter
public class ResourceNotFoundException extends RuntimeException {
    
    private final String resourceName;
    private final String resourceId;
    
    public ResourceNotFoundException(String resourceName, String resourceId) {
        super(String.format("%s not found with id: %s", resourceName, resourceId));
        this.resourceName = resourceName;
        this.resourceId = resourceId;
    }
    
    public ResourceNotFoundException(String resourceName, String fieldName, String fieldValue) {
        super(String.format("%s not found with %s: %s", resourceName, fieldName, fieldValue));
        this.resourceName = resourceName;
        this.resourceId = fieldValue;
    }
}
