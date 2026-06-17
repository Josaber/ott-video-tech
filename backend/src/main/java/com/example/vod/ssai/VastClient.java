package com.example.vod.ssai;

import com.example.vod.config.SsaiProperties;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

@Component
public class VastClient {

    private static final Logger log = LoggerFactory.getLogger(VastClient.class);

    private final RestClient restClient;
    private final SsaiProperties properties;

    public VastClient(RestClient restClient, SsaiProperties properties) {
        this.restClient = restClient;
        this.properties = properties;
    }

    public AdResponse fetchAd(String adId) throws IOException {
        String url = properties.getAdServiceBaseUrl() + "/vast?adId=" + adId;
        log.info("fetching VAST from {}", url);
        String xml = restClient.get().uri(url).retrieve().body(String.class);
        if (xml == null || xml.isBlank()) {
            throw new IOException("empty VAST response");
        }
        return parse(xml);
    }

    public AdResponse parse(String xml) throws IOException {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setExpandEntityReferences(false);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));

            String adId = textOfAttr(doc, "Ad", "id");
            String duration = textOf(doc, "Duration");
            String mediaUrl = textOf(doc, "MediaFile");
            if (mediaUrl == null || mediaUrl.isBlank()) {
                throw new IOException("VAST has no MediaFile");
            }
            int durationSeconds = parseDurationSeconds(duration);
            return new AdResponse(adId, mediaUrl.trim(), durationSeconds);
        } catch (ParserConfigurationException | SAXException e) {
            throw new IOException("failed to parse VAST", e);
        }
    }

    private static String textOfAttr(Document doc, String tag, String attr) {
        NodeList list = doc.getElementsByTagName(tag);
        if (list.getLength() == 0) return null;
        Node node = list.item(0).getAttributes().getNamedItem(attr);
        return node == null ? null : node.getNodeValue();
    }

    private static String textOf(Document doc, String tag) {
        NodeList list = doc.getElementsByTagName(tag);
        if (list.getLength() == 0) return null;
        return list.item(0).getTextContent();
    }

    private static int parseDurationSeconds(String duration) {
        if (duration == null) return 0;
        String[] parts = duration.trim().split(":");
        if (parts.length != 3) return 0;
        try {
            int h = Integer.parseInt(parts[0]);
            int m = Integer.parseInt(parts[1]);
            double s = Double.parseDouble(parts[2]);
            return (int) Math.round(h * 3600 + m * 60 + s);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    public record AdResponse(String adId, String manifestUrl, int durationSeconds) {}
}
