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
@Table(name = "chat_participant")
public class ChatParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chat_participant_id")
    public Long chatParticipantId;

    @Column(name = "room_id", nullable = false)
    public Long roomId;

    @Column(name = "user_id", nullable = false)
    public Long userId;

    @Column(name = "last_read_at")
    public Instant lastReadAt;

    @Column(name = "joined_at", insertable = false, updatable = false)
    public Instant joinedAt;
}
