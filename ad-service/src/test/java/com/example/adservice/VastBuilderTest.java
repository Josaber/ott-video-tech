package com.example.adservice;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.adservice.config.AdProperties;
import com.example.adservice.config.AdProperties.AdEntry;
import com.example.adservice.service.VastBuilder;
import org.junit.jupiter.api.Test;

class VastBuilderTest {

    @Test
    void buildsValidVastWithMediaFileUrl() {
        AdProperties props = new AdProperties();
        props.setPublicBaseUrl("http://localhost:8090");
        VastBuilder builder = new VastBuilder(props);

        AdEntry ad = new AdEntry();
        ad.setId("preroll-brand-a");
        ad.setTitle("Brand A");
        ad.setDurationSeconds(5);

        String xml = builder.buildVast(ad);

        assertThat(xml).contains("<VAST version=\"4.2\">");
        assertThat(xml).contains("<Ad id=\"preroll-brand-a\">");
        assertThat(xml).contains("<Duration>00:00:05</Duration>");
        assertThat(xml).contains("http://localhost:8090/ads/preroll-brand-a/master.m3u8");
        assertThat(xml).contains("application/vnd.apple.mpegurl");
    }
}
