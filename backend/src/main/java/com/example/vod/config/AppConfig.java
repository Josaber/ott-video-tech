package com.example.vod.config;

import java.time.Duration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.example.vod.service.LicenseUrlSigner;
import org.springframework.boot.web.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.web.client.ClientHttpRequestFactorySettings;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties({MediaProperties.class, SsaiProperties.class, TemporalProperties.class, JwtProperties.class})
public class AppConfig {

    @Bean
    public LicenseUrlSigner licenseUrlSigner(JwtProperties jwtProperties) {
        return new LicenseUrlSigner(jwtProperties);
    }

    @Bean
    public RestClient restClient() {
        // Hard timeouts so a hung ad-service can't pin a backend worker
        // thread indefinitely. 5s connect / 10s read is enough for a
        // freshly-generated VAST + cached manifest fetch over loopback.
        var settings = ClientHttpRequestFactorySettings.defaults()
                .withConnectTimeout(Duration.ofSeconds(5))
                .withReadTimeout(Duration.ofSeconds(10));
        var requestFactory = ClientHttpRequestFactoryBuilder.detect().build(settings);
        return RestClient.builder().requestFactory(requestFactory).build();
    }
}
