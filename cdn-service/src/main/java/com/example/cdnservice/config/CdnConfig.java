package com.example.cdnservice.config;

import java.time.Duration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableConfigurationProperties(CdnProperties.class)
public class CdnConfig {

    @Bean
    public RestClient restClient() {
        var rf = new SimpleClientHttpRequestFactory();
        rf.setConnectTimeout(Duration.ofSeconds(5));
        rf.setReadTimeout(Duration.ofSeconds(30));
        return RestClient.builder().requestFactory(rf).build();
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        // Browser plays segments directly from this origin — needs CORS for
        // the Vite dev server on :5173 (and a few common variants).
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry r) {
                r.addMapping("/**")
                    .allowedOriginPatterns(
                        "http://127.0.0.1:5173", "http://localhost:5173",
                        "http://127.0.0.1:*",    "http://localhost:*")
                    .allowedMethods("GET", "HEAD", "OPTIONS")
                    .allowedHeaders("*")
                    .maxAge(3600);
            }
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var cfg = new CorsConfiguration();
        cfg.addAllowedOriginPattern("*");
        cfg.addAllowedMethod("*");
        cfg.addAllowedHeader("*");
        var src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}
