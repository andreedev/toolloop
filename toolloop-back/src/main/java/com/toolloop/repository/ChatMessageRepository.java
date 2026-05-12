package com.toolloop.repository;

import com.toolloop.model.entity.ChatMessage;
import com.toolloop.model.entity.ChatParticipant;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;

@Slf4j
@ApplicationScoped
public class ChatMessageRepository extends BaseRepository<ChatMessage> {

    public Long countTotalUnreadMessages(Long currentUserId) {
        Object result = em().createNativeQuery("""
            SELECT COUNT(cm.message_id)
            FROM chat_message cm
            JOIN chat_participant cp ON cm.room_id = cp.room_id
            WHERE cp.user_id = :userId
              AND cm.sender_id != :userId
              AND cm.created_at > cp.last_read_at
        """)
                .setParameter("userId", currentUserId)
                .getSingleResult();

        return result != null ? ((Number) result).longValue() : 0L;
    }

}