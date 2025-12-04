package com.gs.dsp.shared.infrastructure.config;

import com.gs.dsp.shared.kernel.constants.AppConstants;
import com.gs.dsp.shared.kernel.constants.ErrorMessages;
import com.gs.dsp.iam.application.service.ApiKeyApplicationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class TenantInterceptor implements HandlerInterceptor {

    private static final String TENANT_HEADER = AppConstants.HEADER_TENANT_ID;
    private static final String API_KEY_HEADER = AppConstants.HEADER_API_KEY;

    private final ApiKeyApplicationService apiKeyService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (AppConstants.METHOD_OPTIONS.equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // 1. Check for API Key
        String apiKey = request.getHeader(API_KEY_HEADER);
        if (apiKey != null && !apiKey.isBlank()) {
            return apiKeyService.validateApiKey(apiKey)
                    .map(key -> {
                        TenantContext.setTenantId(key.getTenantId().getId());
                        return true;
                    })
                    .orElseGet(() -> {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        try {
                            response.getWriter().write(ErrorMessages.INVALID_API_KEY);
                        } catch (Exception e) {
                            // ignore
                        }
                        return false;
                    });
        }

        // 2. Fallback to X-Tenant-ID (Legacy/Dev)
        String tenantId = request.getHeader(TENANT_HEADER);
        if (tenantId == null || tenantId.isBlank()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(ErrorMessages.MISSING_HEADERS);
            return false;
        }
        TenantContext.setTenantId(tenantId);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        TenantContext.clear();
    }
}
