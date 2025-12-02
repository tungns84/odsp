package com.gs.dsp.config;

import com.gs.dsp.shared.kernel.constants.AppConstants;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private TenantInterceptor tenantInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(tenantInterceptor)
                .addPathPatterns("/api/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5176", "http://localhost:5177", "http://localhost:3000", "http://localhost:5173")
                .allowedMethods(AppConstants.METHOD_GET, AppConstants.METHOD_POST, AppConstants.METHOD_PUT, AppConstants.METHOD_DELETE, AppConstants.METHOD_OPTIONS)
                .allowedHeaders("*")
                .exposedHeaders(AppConstants.HEADER_TENANT_ID)
                .allowCredentials(true);
    }
}
