package com.toolloop.model.entity;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.Instant;

@RegisterForReflection
@Data
@NoArgsConstructor
@Entity
@Table(name = "chat_message")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    public Long messageId;

    @Column(name = "room_id", nullable = false)
    public Long roomId;

    @Column(name = "sender_id", nullable = false)
    public Long senderId;

    @Column(name = "message_text", nullable = false, columnDefinition = "TEXT")
    public String messageText;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", columnDefinition = "ENUM('TEXT', 'SYSTEM')")
    public MessageType messageType = MessageType.TEXT;

    @Column(name = "created_at", insertable = false, updatable = false)
    public Instant createdAt;

    public enum MessageType {
        TEXT, SYSTEM
    }
}
