package com.gs.dsp.shared.infrastructure.web;

import com.gs.dsp.shared.infrastructure.filter.TraceIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for standardized error responses across the application.
 * All error responses include traceId for correlation with server logs.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex,
            HttpServletRequest request) {
        String traceId = TraceIdFilter.getCurrentTraceId();
        log.warn("[traceId={}] Validation error: {}", traceId, ex.getMessage());
        
        ErrorResponse error = new ErrorResponse(
            "VALIDATION_ERROR",
            ex.getMessage(),
            request.getRequestURI()
        );
        
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(SecurityException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseEntity<ErrorResponse> handleSecurityException(
            SecurityException ex,
            HttpServletRequest request) {
        String traceId = TraceIdFilter.getCurrentTraceId();
        log.error("[traceId={}] Security exception: {}", traceId, ex.getMessage());
        
        ErrorResponse error = new ErrorResponse(
            "SECURITY_ERROR",
            ex.getMessage(),
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<ErrorResponse> handleIllegalStateException(
            IllegalStateException ex,
            HttpServletRequest request) {
        String traceId = TraceIdFilter.getCurrentTraceId();
        log.error("[traceId={}] Internal state error: {}", traceId, ex.getMessage(), ex);
        
        ErrorResponse error = new ErrorResponse(
            "INTERNAL_ERROR",
            ex.getMessage(),
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        String traceId = TraceIdFilter.getCurrentTraceId();
        log.warn("[traceId={}] Bean validation error: {}", traceId, ex.getMessage());
        
        Map<String, Object> details = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fieldError ->
            details.put(fieldError.getField(), fieldError.getDefaultMessage())
        );
        
        ErrorResponse error = new ErrorResponse();
        error.setTimestamp(java.time.LocalDateTime.now());
        error.setCode("VALIDATION_ERROR");
        error.setMessage("Validation failed");
        error.setPath(request.getRequestURI());
        error.setTraceId(traceId);
        error.setDetails(details);
        
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler({
        java.sql.SQLException.class,
        java.net.SocketTimeoutException.class,
        java.net.ConnectException.class,
        org.springframework.dao.DataAccessException.class
    })
    @ResponseStatus(HttpStatus.BAD_GATEWAY)
    public ResponseEntity<ErrorResponse> handleConnectionException(
            Exception ex,
            HttpServletRequest request) {
        String traceId = TraceIdFilter.getCurrentTraceId();
        log.error("[traceId={}] Connection error: {}", traceId, ex.getMessage());
        
        ErrorResponse error = new ErrorResponse(
            "CONNECTION_ERROR",
            "Failed to connect to the data source. Please check your configuration.",
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(error);
    }

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<ErrorResponse> handleRuntimeException(
            RuntimeException ex,
            HttpServletRequest request) {
        String traceId = TraceIdFilter.getCurrentTraceId();
        log.error("[traceId={}] Unexpected runtime error: {}", traceId, ex.getMessage(), ex);
        
        ErrorResponse error = new ErrorResponse(
            "INTERNAL_ERROR",
            "An unexpected error occurred",
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request) {
        String traceId = TraceIdFilter.getCurrentTraceId();
        log.error("[traceId={}] Unexpected error: {}", traceId, ex.getMessage(), ex);
        
        ErrorResponse error = new ErrorResponse(
            "INTERNAL_ERROR",
            "An unexpected error occurred",
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

