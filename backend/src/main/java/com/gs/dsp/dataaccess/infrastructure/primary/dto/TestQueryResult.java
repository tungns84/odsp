package com.gs.dsp.dataaccess.infrastructure.primary.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO for test query results.
 * Contains the generated SQL and the result rows.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestQueryResult {
    private String sql;
    private List<Map<String, Object>> results;
    
    /**
     * Get the number of rows returned
     */
    public int getRowCount() {
        return results != null ? results.size() : 0;
    }
    
    /**
     * Check if the result is empty
     */
    public boolean isEmpty() {
        return results == null || results.isEmpty();
    }
}
