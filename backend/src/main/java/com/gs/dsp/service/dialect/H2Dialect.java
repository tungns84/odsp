package com.gs.dsp.service.dialect;

import com.gs.dsp.dataaccess.infrastructure.query.DynamicQueryService.FieldDefinition;
import com.gs.dsp.dataaccess.infrastructure.query.DynamicQueryService.MaskingConfig;
import org.springframework.stereotype.Component;

@Component
public class H2Dialect implements SqlDialect {

    @Override
    public boolean supports(String driverClass) {
        return "org.h2.Driver".equals(driverClass);
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
                // H2 REGEXP_REPLACE syntax is similar to Postgres but flags might differ slightly in older versions
                // For modern H2, REGEXP_REPLACE(input, regex, replacement) works.
                return String.format("REGEXP_REPLACE(%s, '%s', '%s') AS %s", 
                        colName, masking.getPattern(), masking.getReplacement(), alias);
            }
        }
        
        return field.getAlias() != null ? colName + " AS " + alias : colName;
    }
}
