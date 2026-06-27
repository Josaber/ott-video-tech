package com.example.vod.config;

import com.example.vod.web.CmcdWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final CmcdWebSocketHandler cmcdHandler;

    public WebSocketConfig(CmcdWebSocketHandler cmcdHandler) {
        this.cmcdHandler = cmcdHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(cmcdHandler, "/ws/cmcd")
                .setAllowedOriginPatterns("*");
    }
}
