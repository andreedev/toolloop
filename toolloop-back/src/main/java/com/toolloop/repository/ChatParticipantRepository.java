package com.toolloop.repository;

import com.toolloop.model.entity.ChatParticipant;
import com.toolloop.model.entity.VerificationCode;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import java.util.List;

@Slf4j
@ApplicationScoped
public class ChatParticipantRepository extends BaseRepository<ChatParticipant> {

    public void markAsRead(Long roomId, Long userId) {
        em().createNativeQuery("""
            UPDATE chat_participant 
            SET last_read_at = CURRENT_TIMESTAMP 
            WHERE room_id = :roomId AND user_id = :userId
        """)
                .setParameter("roomId", roomId)
                .setParameter("userId", userId)
                .executeUpdate();
    }

}