package com.example.vod;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.vod.ssai.VastClient;
import com.example.vod.ssai.VastClient.AdResponse;
import java.io.IOException;
import org.junit.jupiter.api.Test;

class VastClientParseTest {

    private static final String VAST = """
        <?xml version="1.0" encoding="UTF-8"?>
        <VAST version="4.2">
          <Ad id="preroll-brand-a">
            <InLine>
              <AdSystem>Demo</AdSystem>
              <AdTitle>Demo</AdTitle>
              <Creatives>
                <Creative>
                  <Linear>
                    <Duration>00:00:05</Duration>
                    <MediaFiles>
                      <MediaFile delivery="streaming" type="application/vnd.apple.mpegurl">
                        <![CDATA[http://127.0.0.1:8090/ads/preroll-brand-a/master.m3u8]]>
                      </MediaFile>
                    </MediaFiles>
                  </Linear>
                </Creative>
              </Creatives>
            </InLine>
          </Ad>
        </VAST>
        """;

    @Test
    void parsesAdIdMediaUrlAndDuration() throws IOException {
        VastClient client = new VastClient(null, null);
        AdResponse ad = client.parse(VAST);
        assertThat(ad.adId()).isEqualTo("preroll-brand-a");
        assertThat(ad.manifestUrl()).isEqualTo("http://127.0.0.1:8090/ads/preroll-brand-a/master.m3u8");
        assertThat(ad.durationSeconds()).isEqualTo(5);
    }
}
