package com.example.vod.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS is configured centrally as a CorsConfigurationSource bean in
 * {@link SecurityConfig} so both the Spring Security filter chain and
 * Spring MVC pick up the same policy. Kept here as a placeholder for
 * future MVC-only customizations (interceptors, formatters, etc.).
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
}
