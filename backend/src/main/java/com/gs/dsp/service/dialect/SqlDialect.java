package com.gs.dsp.service.dialect;

import com.gs.dsp.dataaccess.infrastructure.query.DynamicQueryService.FieldDefinition;

public interface SqlDialect {
    String buildColumnSelection(FieldDefinition field);
    boolean supports(String driverClass);
}
