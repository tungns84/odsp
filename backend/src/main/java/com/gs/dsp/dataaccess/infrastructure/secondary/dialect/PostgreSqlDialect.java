package com.gs.dsp.dataaccess.infrastructure.secondary.dialect;

import com.gs.dsp.dataaccess.domain.model.FieldDefinition;
import com.gs.dsp.dataaccess.domain.model.MaskingConfig;
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
            if (masking.isFixed()) {
                String replacement = masking.getReplacement() != null ? masking.getReplacement() : "*****";
                return String.format("'%s' AS %s", replacement, alias);
            } else if (masking.isRegex()) {
                // REGEXP_REPLACE(source, pattern, replacement, flags)
                // Postgres uses 'g' flag for global replacement
                return String.format("REGEXP_REPLACE(%s, '%s', '%s', 'g') AS %s", 
                        colName, masking.getPattern(), masking.getReplacement(), alias);
            }
        }
        
        return field.getAlias() != null ? colName + " AS " + alias : colName;
    }
}
