package com.toolloop.model.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RegisterForReflection
public class GenericWebSocketMessage {
    private String type;        // "CHAT", "NOTIFICATION", "VERIFICATION", "PONG"
    private Long userId;        // Remitente (quién lo envía)
    private Long recipientId;   // Destinatario (para quién es, opcional en pings)
    private Object data;        // El contenido real (un String, un objeto Chat, etc.)
    private Long timestamp;
}