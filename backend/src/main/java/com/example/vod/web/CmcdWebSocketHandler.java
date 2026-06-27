package com.example.vod.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArraySet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * Broadcasts each freshly-ingested CMCD beacon to every connected
 * subscriber. The CmcdController pushes JSON-encoded events here on
 * /ingest; clients open a WS at /ws/cmcd and get a live feed without
 * polling.
 *
 * Demo-grade: no auth on the WS upgrade (the data is observational and
 * the trust boundary lives at the cdn-service edge that produces it).
 * Sessions are tracked in a CopyOnWriteArraySet — fine for the demo's
 * single-process broadcast pattern.
 */
@Component
public class CmcdWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(CmcdWebSocketHandler.class);

    private final CopyOnWriteArraySet<WebSocketSession> sessions = new CopyOnWriteArraySet<>();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        log.debug("cmcd ws connected: {} (total={})", session.getId(), sessions.size());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        log.debug("cmcd ws closed: {} ({})", session.getId(), status);
    }

    public void broadcast(Map<String, Object> beacon) {
        if (sessions.isEmpty()) return;
        String payload;
        try {
            payload = mapper.writeValueAsString(beacon);
        } catch (Exception e) {
            log.debug("cmcd ws serialize failed: {}", e.getMessage());
            return;
        }
        TextMessage msg = new TextMessage(payload);
        for (WebSocketSession s : sessions) {
            if (!s.isOpen()) {
                sessions.remove(s);
                continue;
            }
            try {
                s.sendMessage(msg);
            } catch (IOException e) {
                log.debug("cmcd ws send failed for {}: {}", s.getId(), e.getMessage());
                sessions.remove(s);
            }
        }
    }
}
