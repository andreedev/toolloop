package com.toolloop.resource.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.toolloop.model.dto.GenericWebSocketMessage;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.websocket.Session;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@ApplicationScoped
public class WebSocketManager {

    private final Map<String, Session> userSessions = new ConcurrentHashMap<>();

    @Inject
    ObjectMapper objectMapper;

    public void addClient(String userId, Session session) {
        userSessions.put(userId, session);
        log.info("Usuario {} conectado. Total: {}", userId, userSessions.size());
    }

    public void removeClient(String userId) {
        userSessions.remove(userId);
        log.info("Usuario {} desconectado. Total: {}", userId, userSessions.size());
    }

    /**
     * Envía un mensaje a un usuario específico.
     * Útil para: "El usuario B escribió el código, notificar al dueño A"
     */
    public void sendToUser(Long userId, String type, Object data) {
        String userIdStr = String.valueOf(userId);
        Session session = userSessions.get(userIdStr);

        if (session != null && session.isOpen()) {
            try {
                GenericWebSocketMessage message = GenericWebSocketMessage.builder()
                        .type(type)
                        .data(data)
                        .userId(userId)
                        .timestamp(System.currentTimeMillis() / 1000L)
                        .build();

                String json = objectMapper.writeValueAsString(message);
                session.getAsyncRemote().sendText(json);
                log.debug("Mensaje [{}] enviado a usuario {}", type, userId);
            } catch (Exception e) {
                log.error("Error enviando WS a usuario {}: {}", userId, e.getMessage());
            }
        } else {
            log.debug("Usuario {} no tiene sesión activa. Notificación real-time omitida.", userId);
        }
    }

    public boolean isUserConnected(Long userId) {
        return userSessions.containsKey(String.valueOf(userId));
    }
}