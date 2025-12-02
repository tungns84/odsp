package com.gs.dsp.service.dialect;

import com.gs.dsp.service.DynamicQueryService.FieldDefinition;
import com.gs.dsp.service.DynamicQueryService.MaskingConfig;
import org.springframework.stereotype.Component;

@Component
public class PostgreSqlDialect implements SqlDialect {

    @Override
    public boolean supports(String driverClass) {
        return "org.postgresql.Driver".equals(driverClass);
    }

    @Override
    public String buildColumnSelection(FieldDefinition field) {
        String colName = field.getName();
        String alias = field.getAlias() != null ? field.getAlias() : field.getName();
        
        MaskingConfig masking = field.getMasking();
        if (masking != null && masking.isEnabled()) {
            if ("FIXED".equalsIgnoreCase(masking.getType())) {
                String replacement = masking.getReplacement() != null ? masking.getReplacement() : "*****";
                return String.format("'%s' AS %s", replacement, alias);
            } else if ("REGEX".equalsIgnoreCase(masking.getType())) {
                // REGEXP_REPLACE(source, pattern, replacement, flags)
                // Postgres uses 'g' flag for global replacement
                return String.format("REGEXP_REPLACE(%s, '%s', '%s', 'g') AS %s", 
                        colName, masking.getPattern(), masking.getReplacement(), alias);
            }
        }
        
        return field.getAlias() != null ? colName + " AS " + alias : colName;
    }
}
