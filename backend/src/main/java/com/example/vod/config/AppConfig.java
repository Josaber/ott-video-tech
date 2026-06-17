package com.example.vod.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties({MediaProperties.class, SsaiProperties.class, TemporalProperties.class, JwtProperties.class})
public class AppConfig {

    @Bean
    public RestClient restClient() {
        return RestClient.builder().build();
    }
}
