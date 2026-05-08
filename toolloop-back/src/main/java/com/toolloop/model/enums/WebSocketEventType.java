package com.toolloop.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;


@Getter
@RequiredArgsConstructor
public enum WebSocketEventType {
    CHAT("chat"),
    HANDOVER_CONFIRMED("handover_confirmed"),
    RETURN_CONFIRMED("return_confirmed"),
    MESSAGE_SENT("message_sent"),
    PING("ping");

    private final String value;

    public static WebSocketEventType fromString(String text) {
        for (WebSocketEventType b : WebSocketEventType.values()) {
            if (b.value.equalsIgnoreCase(text)) {
                return b;
            }
        }
        return null;
    }
}