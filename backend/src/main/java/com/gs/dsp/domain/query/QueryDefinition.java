package com.gs.dsp.domain.query;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class QueryDefinition {
    private QueryMode mode;
    
    // Builder Mode Fields
    private String rootTable;
    private List<JoinDefinition> joins;
    private List<ColumnDefinition> columns;
    private List<FilterCondition> filters;
    private List<SortDefinition> sort;
    private Integer limit;
    
    // SQL Mode Fields
    private String sql;
    private List<Object> params;

    public enum QueryMode {
        BUILDER,
        SQL
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JoinDefinition {
        private String type; // INNER, LEFT, RIGHT
        private String table;
        private String on;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ColumnDefinition {
        private String table;
        private String name;
        private String alias;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FilterCondition {
        private String field;
        private String operator; // EQ, NEQ, GT, LT, GTE, LTE, LIKE, IN
        private Object value;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SortDefinition {
        private String field;
        private String direction; // ASC, DESC
    }
}
