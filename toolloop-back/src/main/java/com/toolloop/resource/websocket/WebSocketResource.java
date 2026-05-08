package com.toolloop.resource.websocket;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.toolloop.model.dto.GenericWebSocketMessage;
import com.toolloop.model.enums.WebSocketEventType;
import com.toolloop.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;

@Slf4j
@ApplicationScoped
@ServerEndpoint(value = "/ws/toolloop")
public class WebSocketResource {

    @Inject
    WebSocketManager webSocketManager;

    @Inject
    JwtUtil jwtUtil;

    @Inject
    ObjectMapper objectMapper;

    private static final String WS_USER_ID_KEY = "ws_user_id";

    @OnOpen
    public void onOpen(Session session) {
        try {
            String token = extractToken(session);

            if (token == null || token.isEmpty()) {
                log.warn("Intento de conexión WS sin token");
                session.close(new CloseReason(CloseReason.CloseCodes.VIOLATED_POLICY, "Token missing"));
                return;
            }

            DecodedJWT claims = jwtUtil.parseToken(token);
            String userId = claims.getSubject();

            if (userId == null) {
                session.close(new CloseReason(CloseReason.CloseCodes.VIOLATED_POLICY, "Invalid Sub"));
                return;
            }

            session.getUserProperties().put(WS_USER_ID_KEY, userId);
            webSocketManager.addClient(userId, session);
            log.info("WebSocket conectado para usuario: {}", userId);

        } catch (Exception e) {
            log.error("Error en WS onOpen: {}", e.getMessage());
            try { session.close(); } catch (Exception ignored) {}
        }
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        try {
            String currentUserIdStr = (String) session.getUserProperties().get(WS_USER_ID_KEY);
            Long currentUserId = Long.parseLong(currentUserIdStr);

            GenericWebSocketMessage msg = objectMapper.readValue(message, GenericWebSocketMessage.class);
            msg.setUserId(currentUserId);

            WebSocketEventType eventType = WebSocketEventType.fromString(msg.getType());

            if (eventType == null) {
                log.info("Tipo de mensaje desconocido: {}", msg.getType());
                return;
            }

            switch (eventType) {
                case CHAT -> handleChatMessage(msg);
                case HANDOVER_CONFIRMED -> handleRentalHandover(msg);
                case PING -> sendPong(session, currentUserIdStr);
                case MESSAGE_SENT -> log.debug("Message delivery confirmed");
            }
        } catch (Exception e) {
            log.error("Error procesando mensaje: {}", e.getMessage());
        }
    }

    private void handleRentalHandover(GenericWebSocketMessage msg) {

    }

    private void handleChatMessage(GenericWebSocketMessage msg) {
        // chatService.save(msg.getUserId(), msg.getRecipientId(), msg.getData().toString());
        webSocketManager.sendToUser(msg.getRecipientId(), "CHAT", msg);
    }

    @OnClose
    public void onClose(Session session) {
        String userId = (String) session.getUserProperties().get(WS_USER_ID_KEY);
        if (userId != null) {
            webSocketManager.removeClient(userId);
        }
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        log.error("Error en WebSocket: {}", throwable.getMessage());
    }

    private String extractToken(Session session) {
        String query = session.getQueryString();
        if (query != null && query.contains("token=")) {
            return query.split("token=")[1].split("&")[0];
        }
        return null;
    }

    private void sendPong(Session session, String userId) {
        try {
            session.getAsyncRemote().sendText("{\"type\":\"pong\"}");
        } catch (Exception e) {
            log.error("Error enviando pong a {}", userId);
        }
    }
}
