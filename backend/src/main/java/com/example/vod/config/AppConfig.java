package com.example.vod.config;

import java.time.Duration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.example.vod.service.LicenseUrlSigner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties({MediaProperties.class, SsaiProperties.class, TemporalProperties.class, JwtProperties.class, LicenseProperties.class})
public class AppConfig {

    @Bean
    public LicenseUrlSigner licenseUrlSigner(LicenseProperties licenseProperties) {
        return new LicenseUrlSigner(licenseProperties);
    }

    @Bean
    public RestClient restClient() {
        // Hard timeouts so a hung ad-service can't pin a backend worker
        // thread indefinitely. 5s connect / 10s read is enough for a
        // freshly-generated VAST + cached manifest fetch over loopback.
        //
        // Spring Boot 4.0 removed ClientHttpRequestFactoryBuilder/Settings
        // (the old org.springframework.boot.web.client.* facade); plain
        // SimpleClientHttpRequestFactory from spring-web is what's left.
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(10));
        return RestClient.builder().requestFactory(requestFactory).build();
    }
}
