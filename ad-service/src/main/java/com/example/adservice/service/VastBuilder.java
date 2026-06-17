package com.example.adservice.service;

import com.example.adservice.config.AdProperties;
import com.example.adservice.config.AdProperties.AdEntry;
import org.springframework.stereotype.Service;

@Service
public class VastBuilder {

    private final AdProperties properties;

    public VastBuilder(AdProperties properties) {
        this.properties = properties;
    }

    public String buildVast(AdEntry ad) {
        String base = properties.getPublicBaseUrl();
        String mediaUrl = base + "/ads/" + ad.getId() + "/master.m3u8";
        String duration = formatDuration(ad.getDurationSeconds());

        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<VAST version=\"4.2\">\n");
        sb.append("  <Ad id=\"").append(ad.getId()).append("\">\n");
        sb.append("    <InLine>\n");
        sb.append("      <AdSystem version=\"1.0\">OTT Demo Ad Service</AdSystem>\n");
        sb.append("      <AdTitle><![CDATA[").append(ad.getTitle()).append("]]></AdTitle>\n");
        sb.append("      <Impression><![CDATA[").append(base).append("/track/impression?adId=").append(ad.getId()).append("]]></Impression>\n");
        sb.append("      <Creatives>\n");
        sb.append("        <Creative id=\"").append(ad.getId()).append("-c1\" sequence=\"1\">\n");
        sb.append("          <Linear>\n");
        sb.append("            <Duration>").append(duration).append("</Duration>\n");
        sb.append("            <MediaFiles>\n");
        sb.append("              <MediaFile delivery=\"streaming\" type=\"application/vnd.apple.mpegurl\" ")
          .append("width=\"1280\" height=\"720\" bitrate=\"1200\" codec=\"avc1.640028,mp4a.40.2\">")
          .append("<![CDATA[").append(mediaUrl).append("]]></MediaFile>\n");
        sb.append("            </MediaFiles>\n");
        sb.append("          </Linear>\n");
        sb.append("        </Creative>\n");
        sb.append("      </Creatives>\n");
        sb.append("    </InLine>\n");
        sb.append("  </Ad>\n");
        sb.append("</VAST>\n");
        return sb.toString();
    }

    private String formatDuration(int seconds) {
        int h = seconds / 3600;
        int m = (seconds % 3600) / 60;
        int s = seconds % 60;
        return String.format("%02d:%02d:%02d", h, m, s);
    }
}
