package com.gs.dsp.shared.infrastructure.web;

import com.gs.dsp.shared.infrastructure.filter.TraceIdFilter;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standard error response format for all API errors.
 * Includes traceId for correlation with server logs.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    private LocalDateTime timestamp;
    private String code;       // Unique error code (e.g., VALIDATION_ERROR, INTERNAL_ERROR)
    private String message;    // Human-readable error message
    private String path;       // Request path that caused the error
    private String traceId;    // Correlation ID for log tracing
    private Map<String, Object> details;  // Additional error details (e.g., field validation errors)

    public ErrorResponse(String code, String message) {
        this.timestamp = LocalDateTime.now();
        this.code = code;
        this.message = message;
        this.traceId = TraceIdFilter.getCurrentTraceId();
    }

    public ErrorResponse(String code, String message, String path) {
        this.timestamp = LocalDateTime.now();
        this.code = code;
        this.message = message;
        this.path = path;
        this.traceId = TraceIdFilter.getCurrentTraceId();
    }

    public ErrorResponse(String code, String message, String path, String traceId) {
        this.timestamp = LocalDateTime.now();
        this.code = code;
        this.message = message;
        this.path = path;
        this.traceId = traceId;
    }
}
