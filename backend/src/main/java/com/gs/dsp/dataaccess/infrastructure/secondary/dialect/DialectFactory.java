package com.gs.dsp.dataaccess.infrastructure.secondary.dialect;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class DialectFactory {

    private final List<SqlDialect> dialects;

    public DialectFactory(List<SqlDialect> dialects) {
        this.dialects = dialects;
    }

    public Optional<SqlDialect> getDialect(String driverClass) {
        return dialects.stream()
                .filter(d -> d.supports(driverClass))
                .findFirst();
    }
}
