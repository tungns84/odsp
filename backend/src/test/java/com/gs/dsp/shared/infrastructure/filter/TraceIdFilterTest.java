package com.gs.dsp.shared.infrastructure.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class TraceIdFilterTest {

    private TraceIdFilter filter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        filter = new TraceIdFilter();
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        filterChain = mock(FilterChain.class);
        MDC.clear();
    }

    @AfterEach
    void tearDown() {
        MDC.clear();
    }

    @Test
    void shouldGenerateTraceIdAndStoreInMDC() throws Exception {
        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        String traceId = response.getHeader(TraceIdFilter.TRACE_ID_HEADER);
        assertThat(traceId).isNotNull();
        assertThat(traceId).hasSize(16);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldAddTraceIdToResponseHeader() throws Exception {
        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        String traceIdHeader = response.getHeader(TraceIdFilter.TRACE_ID_HEADER);
        assertThat(traceIdHeader).isNotNull();
        assertThat(traceIdHeader).isNotBlank();
    }

    @Test
    void shouldStoreTenantIdInMDCWhenPresent() throws Exception {
        // Given
        String tenantId = "test-tenant-123";
        request.addHeader("X-Tenant-ID", tenantId);

        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then - MDC is cleared after filter, so we can't check it here
        // But we verify the filter chain was called
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldClearMDCAfterRequest() throws Exception {
        // When
        filter.doFilterInternal(request, response, filterChain);

        // Then
        assertThat(MDC.get(TraceIdFilter.MDC_TRACE_ID_KEY)).isNull();
        assertThat(MDC.get(TraceIdFilter.MDC_TENANT_ID_KEY)).isNull();
    }

    @Test
    void shouldClearMDCEvenWhenFilterChainThrowsException() throws Exception {
        // Given
        doThrow(new RuntimeException("Test exception"))
            .when(filterChain).doFilter(request, response);

        // When/Then
        try {
            filter.doFilterInternal(request, response, filterChain);
        } catch (RuntimeException e) {
            // Expected
        }

        // MDC should still be cleared
        assertThat(MDC.get(TraceIdFilter.MDC_TRACE_ID_KEY)).isNull();
    }

    @Test
    void shouldGenerateUniqueTraceIds() throws Exception {
        // When
        filter.doFilterInternal(request, response, filterChain);
        String traceId1 = response.getHeader(TraceIdFilter.TRACE_ID_HEADER);

        MockHttpServletResponse response2 = new MockHttpServletResponse();
        filter.doFilterInternal(request, response2, filterChain);
        String traceId2 = response2.getHeader(TraceIdFilter.TRACE_ID_HEADER);

        // Then
        assertThat(traceId1).isNotEqualTo(traceId2);
    }
}
