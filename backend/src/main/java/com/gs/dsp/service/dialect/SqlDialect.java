package com.gs.dsp.service.dialect;

import com.gs.dsp.service.DynamicQueryService.FieldDefinition;

public interface SqlDialect {
    String buildColumnSelection(FieldDefinition field);
    boolean supports(String driverClass);
}
