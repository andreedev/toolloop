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

    public boolean isParticipant(Long roomId, Long userId) {
        Object result = em().createNativeQuery("""
            SELECT COUNT(*) FROM chat_participant
            WHERE room_id = :roomId AND user_id = :userId
        """)
                .setParameter("roomId", roomId)
                .setParameter("userId", userId)
                .getSingleResult();
        return result != null && ((Number) result).longValue() > 0;
    }

    public Long findOtherParticipantId(Long roomId, Long currentUserId) {
        Object result = em().createNativeQuery("""
            SELECT user_id FROM chat_participant
            WHERE room_id = :roomId AND user_id != :userId
            LIMIT 1
        """)
                .setParameter("roomId", roomId)
                .setParameter("userId", currentUserId)
                .getSingleResult();
        return result != null ? ((Number) result).longValue() : null;
    }

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

    public void ensureParticipantExists(Long roomId, Long userId) {
        if (!isParticipant(roomId, userId)) {
            ChatParticipant participant = new ChatParticipant();
            participant.setRoomId(roomId);
            participant.setUserId(userId);
            persist(participant);
        }
    }


}