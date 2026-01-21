package com.gs.dsp.shared.infrastructure.web;

import io.micrometer.tracing.Tracer;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final Tracer tracer;

    private String getTraceId() {
        if (tracer != null && tracer.currentSpan() != null) {
            return tracer.currentSpan().context().traceId();
        }
        return null;
    }

    @ExceptionHandler(com.gs.dsp.shared.domain.exception.ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            com.gs.dsp.shared.domain.exception.ResourceNotFoundException ex,
            HttpServletRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        
        ErrorResponse error = new ErrorResponse(
            "RESOURCE_NOT_FOUND",
            ex.getMessage(),
            request.getRequestURI(),
            getTraceId()
        );
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(com.gs.dsp.shared.domain.exception.BusinessException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public ResponseEntity<ErrorResponse> handleBusinessException(
            com.gs.dsp.shared.domain.exception.BusinessException ex,
            HttpServletRequest request) {
        log.warn("Business rule violation: {}", ex.getMessage());
        
        ErrorResponse error = new ErrorResponse(
            ex.getCode(),
            ex.getMessage(),
            request.getRequestURI(),
            getTraceId()
        );
        
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex,
            HttpServletRequest request) {
        log.warn("Validation error: {}", ex.getMessage());
        
        ErrorResponse error = new ErrorResponse(
            "VALIDATION_ERROR",
            ex.getMessage(),
            request.getRequestURI(),
            getTraceId()
        );
        
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(SecurityException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseEntity<ErrorResponse> handleSecurityException(
            SecurityException ex,
            HttpServletRequest request) {
        log.error("Security exception: {}", ex.getMessage());
        
        ErrorResponse error = new ErrorResponse(
            "SECURITY_ERROR",
            ex.getMessage(),
            request.getRequestURI(),
            getTraceId()
        );
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<ErrorResponse> handleIllegalStateException(
            IllegalStateException ex,
            HttpServletRequest request) {
        log.error("Internal state error: {}", ex.getMessage(), ex);
        
        ErrorResponse error = new ErrorResponse(
            "INTERNAL_ERROR",
            ex.getMessage(),
            request.getRequestURI(),
            getTraceId()
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        String traceId = getTraceId();
        log.warn("Bean validation error: {}", ex.getMessage());
        
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
        log.error("Connection error: {}", ex.getMessage());
        
        ErrorResponse error = new ErrorResponse(
            "CONNECTION_ERROR",
            "Failed to connect to the data source. Please check your configuration.",
            request.getRequestURI(),
            getTraceId()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(error);
    }

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<ErrorResponse> handleRuntimeException(
            RuntimeException ex,
            HttpServletRequest request) {
        log.error("Unexpected runtime error: {}", ex.getMessage(), ex);
        
        ErrorResponse error = new ErrorResponse(
            "INTERNAL_ERROR",
            "An unexpected error occurred",
            request.getRequestURI(),
            getTraceId()
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        
        ErrorResponse error = new ErrorResponse(
            "INTERNAL_ERROR",
            "An unexpected error occurred",
            request.getRequestURI(),
            getTraceId()
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

