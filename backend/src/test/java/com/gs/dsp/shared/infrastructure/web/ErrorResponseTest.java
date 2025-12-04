package com.gs.dsp.shared.infrastructure.web;

import com.gs.dsp.shared.infrastructure.filter.TraceIdFilter;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ErrorResponseTest {

    @BeforeEach
    void setUp() {
        MDC.clear();
    }

    @AfterEach
    void tearDown() {
        MDC.clear();
    }

    @Test
    void shouldCreateErrorResponseWithCodeAndMessage() {
        // When
        ErrorResponse error = new ErrorResponse("TEST_ERROR", "Test message");

        // Then
        assertThat(error.getCode()).isEqualTo("TEST_ERROR");
        assertThat(error.getMessage()).isEqualTo("Test message");
        assertThat(error.getTimestamp()).isNotNull();
        assertThat(error.getTimestamp()).isBefore(LocalDateTime.now().plusSeconds(1));
    }

    @Test
    void shouldCreateErrorResponseWithPath() {
        // When
        ErrorResponse error = new ErrorResponse("TEST_ERROR", "Test message", "/api/test");

        // Then
        assertThat(error.getCode()).isEqualTo("TEST_ERROR");
        assertThat(error.getMessage()).isEqualTo("Test message");
        assertThat(error.getPath()).isEqualTo("/api/test");
    }

    @Test
    void shouldIncludeTraceIdWhenAvailableInMDC() {
        // Given
        String expectedTraceId = "test-trace-123";
        MDC.put(TraceIdFilter.MDC_TRACE_ID_KEY, expectedTraceId);

        // When
        ErrorResponse error = new ErrorResponse("TEST_ERROR", "Test message");

        // Then
        assertThat(error.getTraceId()).isEqualTo(expectedTraceId);
    }

    @Test
    void shouldHandleNullTraceIdWhenNotInMDC() {
        // When
        ErrorResponse error = new ErrorResponse("TEST_ERROR", "Test message");

        // Then
        assertThat(error.getTraceId()).isNull();
    }

    @Test
    void shouldCreateErrorResponseWithAllFields() {
        // Given
        Map<String, Object> details = new HashMap<>();
        details.put("field1", "error1");
        details.put("field2", "error2");

        // When
        ErrorResponse error = new ErrorResponse(
            LocalDateTime.now(),
            "VALIDATION_ERROR",
            "Validation failed",
            "/api/test",
            "trace-123",
            details
        );

        // Then
        assertThat(error.getCode()).isEqualTo("VALIDATION_ERROR");
        assertThat(error.getMessage()).isEqualTo("Validation failed");
        assertThat(error.getPath()).isEqualTo("/api/test");
        assertThat(error.getTraceId()).isEqualTo("trace-123");
        assertThat(error.getDetails()).hasSize(2);
        assertThat(error.getDetails().get("field1")).isEqualTo("error1");
    }

    @Test
    void shouldCreateErrorResponseWithExplicitTraceId() {
        // When
        ErrorResponse error = new ErrorResponse(
            "TEST_ERROR",
            "Test message",
            "/api/test",
            "explicit-trace-id"
        );

        // Then
        assertThat(error.getTraceId()).isEqualTo("explicit-trace-id");
    }
}
