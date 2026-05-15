package com.toolloop.repository;

import com.toolloop.model.dto.ChatMessageDTO;
import com.toolloop.model.entity.ChatMessage;
import com.toolloop.model.entity.ChatParticipant;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.persistence.Tuple;
import java.util.List;

@Slf4j
@ApplicationScoped
public class ChatMessageRepository extends BaseRepository<ChatMessage> {

    public Long countTotalUnreadMessages(Long currentUserId) {
        Object result = em.createNativeQuery("""
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

    @SuppressWarnings("unchecked")
    public List<ChatMessageDTO> findMessagesByRoom(Long roomId, Long currentUserId) {
        List<Tuple> results = em.createNativeQuery("""
            SELECT 
                cm.message_id AS message_id, 
                cm.message_text AS text, 
                cm.created_at AS created_at, 
                (cm.sender_id = :userId) AS is_mine 
            FROM chat_message cm
            WHERE cm.room_id = :roomId
            ORDER BY cm.created_at ASC
        """, Tuple.class)
                    .setParameter("roomId", roomId)
                    .setParameter("userId", currentUserId)
                    .getResultList();

        return results.stream()
                .map(t -> ChatMessageDTO.builder()
                        .messageId(t.get("message_id", Number.class).longValue())
                        .roomId(roomId)
                        .text(t.get("text", String.class))
                        .createdAt(t.get("created_at", java.sql.Timestamp.class).toLocalDateTime())
                        .isMine(t.get("is_mine", Number.class).intValue() == 1)
                        .build())
                .toList();
    }

}