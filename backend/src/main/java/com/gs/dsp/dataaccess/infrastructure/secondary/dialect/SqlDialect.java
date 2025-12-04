package com.gs.dsp.dataaccess.infrastructure.secondary.dialect;

import com.gs.dsp.dataaccess.infrastructure.secondary.query.DynamicQueryService.FieldDefinition;

public interface SqlDialect {
    String buildColumnSelection(FieldDefinition field);
    boolean supports(String driverClass);
}
