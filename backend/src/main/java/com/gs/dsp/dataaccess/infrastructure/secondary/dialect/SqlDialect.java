package com.gs.dsp.dataaccess.infrastructure.secondary.dialect;

import com.gs.dsp.dataaccess.domain.model.FieldDefinition;

public interface SqlDialect {
    String buildColumnSelection(FieldDefinition field);
    boolean supports(String driverClass);
}
