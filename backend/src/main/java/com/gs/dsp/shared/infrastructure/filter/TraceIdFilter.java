package com.gs.dsp.shared.infrastructure.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Filter that generates a unique traceId for every request and stores it in MDC.
 * The traceId is returned in the X-Trace-ID response header for correlation.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TraceIdFilter extends OncePerRequestFilter {

    public static final String TRACE_ID_HEADER = "X-Trace-ID";
    public static final String MDC_TRACE_ID_KEY = "traceId";
    public static final String MDC_USER_ID_KEY = "userId";
    public static final String MDC_TENANT_ID_KEY = "tenantId";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String traceId = generateTraceId();

        try {
            // Store traceId in MDC for logging
            MDC.put(MDC_TRACE_ID_KEY, traceId);

            // Optionally capture tenant ID if available in header
            String tenantId = request.getHeader("X-Tenant-ID");
            if (tenantId != null && !tenantId.isBlank()) {
                MDC.put(MDC_TENANT_ID_KEY, tenantId);
            }

            // Add traceId to response header for client correlation
            response.setHeader(TRACE_ID_HEADER, traceId);

            filterChain.doFilter(request, response);
        } finally {
            // Always clear MDC to prevent memory leaks in thread pools
            MDC.clear();
        }
    }

    /**
     * Generates a unique trace ID for request correlation.
     * Uses a shortened UUID format for readability in logs.
     */
    private String generateTraceId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    /**
     * Gets the current traceId from MDC.
     * Useful for injecting into error responses and other components.
     */
    public static String getCurrentTraceId() {
        return MDC.get(MDC_TRACE_ID_KEY);
    }
}
