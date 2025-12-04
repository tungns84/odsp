package com.gs.dsp.shared.infrastructure.web;

import com.gs.dsp.shared.infrastructure.filter.TraceIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        request = new MockHttpServletRequest("GET", "/api/test");
        MDC.clear();
    }

    @AfterEach
    void tearDown() {
        MDC.clear();
    }

    @Test
    void shouldHandleIllegalArgumentException() {
        // Given
        String traceId = "test-trace-123";
        MDC.put(TraceIdFilter.MDC_TRACE_ID_KEY, traceId);
        IllegalArgumentException ex = new IllegalArgumentException("Invalid argument");

        // When
        ResponseEntity<ErrorResponse> response = handler.handleIllegalArgumentException(ex, request);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo("VALIDATION_ERROR");
        assertThat(response.getBody().getMessage()).isEqualTo("Invalid argument");
        assertThat(response.getBody().getPath()).isEqualTo("/api/test");
        assertThat(response.getBody().getTraceId()).isEqualTo(traceId);
    }

    @Test
    void shouldHandleSecurityException() {
        // Given
        String traceId = "test-trace-456";
        MDC.put(TraceIdFilter.MDC_TRACE_ID_KEY, traceId);
        SecurityException ex = new SecurityException("Access denied");

        // When
        ResponseEntity<ErrorResponse> response = handler.handleSecurityException(ex, request);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo("SECURITY_ERROR");
        assertThat(response.getBody().getMessage()).isEqualTo("Access denied");
        assertThat(response.getBody().getTraceId()).isEqualTo(traceId);
    }

    @Test
    void shouldHandleIllegalStateException() {
        // Given
        String traceId = "test-trace-789";
        MDC.put(TraceIdFilter.MDC_TRACE_ID_KEY, traceId);
        IllegalStateException ex = new IllegalStateException("Invalid state");

        // When
        ResponseEntity<ErrorResponse> response = handler.handleIllegalStateException(ex, request);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo("INTERNAL_ERROR");
        assertThat(response.getBody().getTraceId()).isEqualTo(traceId);
    }

    @Test
    void shouldHandleMethodArgumentNotValidException() {
        // Given
        String traceId = "test-trace-validation";
        MDC.put(TraceIdFilter.MDC_TRACE_ID_KEY, traceId);

        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        
        FieldError fieldError1 = new FieldError("object", "field1", "must not be null");
        FieldError fieldError2 = new FieldError("object", "field2", "must be positive");
        
        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError1, fieldError2));

        // When
        ResponseEntity<ErrorResponse> response = handler.handleValidationException(ex, request);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo("VALIDATION_ERROR");
        assertThat(response.getBody().getMessage()).isEqualTo("Validation failed");
        assertThat(response.getBody().getTraceId()).isEqualTo(traceId);
        assertThat(response.getBody().getDetails()).hasSize(2);
        assertThat(response.getBody().getDetails().get("field1")).isEqualTo("must not be null");
        assertThat(response.getBody().getDetails().get("field2")).isEqualTo("must be positive");
    }

    @Test
    void shouldHandleRuntimeException() {
        // Given
        String traceId = "test-trace-runtime";
        MDC.put(TraceIdFilter.MDC_TRACE_ID_KEY, traceId);
        RuntimeException ex = new RuntimeException("Unexpected error");

        // When
        ResponseEntity<ErrorResponse> response = handler.handleRuntimeException(ex, request);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo("INTERNAL_ERROR");
        assertThat(response.getBody().getMessage()).isEqualTo("An unexpected error occurred");
        assertThat(response.getBody().getTraceId()).isEqualTo(traceId);
    }

    @Test
    void shouldHandleGenericException() {
        // Given
        String traceId = "test-trace-generic";
        MDC.put(TraceIdFilter.MDC_TRACE_ID_KEY, traceId);
        Exception ex = new Exception("Generic error");

        // When
        ResponseEntity<ErrorResponse> response = handler.handleGenericException(ex, request);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo("INTERNAL_ERROR");
        assertThat(response.getBody().getMessage()).isEqualTo("An unexpected error occurred");
        assertThat(response.getBody().getTraceId()).isEqualTo(traceId);
    }

    @Test
    void shouldHandleExceptionWithoutTraceId() {
        // Given - no traceId in MDC
        IllegalArgumentException ex = new IllegalArgumentException("Test error");

        // When
        ResponseEntity<ErrorResponse> response = handler.handleIllegalArgumentException(ex, request);

        // Then
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getTraceId()).isNull();
    }
}
