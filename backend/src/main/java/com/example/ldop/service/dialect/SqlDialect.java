package com.example.ldop.service.dialect;

import com.example.ldop.service.DynamicQueryService.FieldDefinition;

public interface SqlDialect {
    String buildColumnSelection(FieldDefinition field);
    boolean supports(String driverClass);
}
