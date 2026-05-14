package com.toolloop.repository;

import com.toolloop.model.dto.ChatRoomDTO;
import com.toolloop.model.entity.ChatRoom;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.persistence.Tuple;
import java.util.List;

@Slf4j
@ApplicationScoped
public class ChatRoomRepository extends BaseRepository<ChatRoom>{

    public List<ChatRoomDTO> listRoomsByUser(Long currentUserId) {
        log.info("listRoomsByUser currentUserId: {}", currentUserId);
        List<Tuple> results = em().createNativeQuery("""
            SELECT
                cr.room_id AS room_id,
                t.name AS tool_name,
                u_other.name AS other_user_name,
                u_other.profile_photo_key AS other_user_photo,
                (SELECT tp.photo_key FROM tool_photo tp WHERE tp.tool_id = t.tool_id LIMIT 1) AS tool_photo_key,
                (SELECT COUNT(cm.message_id) FROM chat_message cm 
                 WHERE cm.room_id = cr.room_id AND cm.sender_id != cp_me.user_id 
                 AND cm.created_at > cp_me.last_read_at) AS unread_count
            FROM chat_room cr
            JOIN chat_participant cp_me ON cr.room_id = cp_me.room_id AND cp_me.user_id = :userId
            JOIN chat_participant cp_other ON cr.room_id = cp_other.room_id AND cp_other.user_id != :userId
            JOIN user u_other ON cp_other.user_id = u_other.user_id
            JOIN rental r ON cr.rental_id = r.rental_id
            JOIN tool t ON r.tool_id = t.tool_id
        """, Tuple.class)
                    .setParameter("userId", currentUserId)
                    .getResultList();

        log.info("total: {}", results.size());

        return results.stream()
                .map(t -> ChatRoomDTO.builder()
                        .roomId(t.get("room_id", Number.class).longValue())
                        .toolName(t.get("tool_name", String.class))
                        .otherUserName(t.get("other_user_name", String.class))
                        .otherUserPhoto(t.get("other_user_photo", String.class))
                        .toolPhotoKey(t.get("tool_photo_key", String.class))
                        .unreadCount(t.get("unread_count", Number.class) != null ?
                                t.get("unread_count", Number.class).longValue() : 0L)
                        .build())
                .toList();
    }

    @SuppressWarnings("unchecked")
    public ChatRoomDTO getRoomDetails(Long roomId, Long currentUserId) {
        log.info("getRoomDetails for room: {} and user: {}", roomId, currentUserId);

        List<Tuple> results = em().createNativeQuery("""
            SELECT
                cr.room_id AS room_id,
                t.tool_id as tool_id,
                t.name AS tool_name,
                u_other.name AS other_user_name,
                u_other.profile_photo_key AS other_user_photo,
                (SELECT tp.photo_key FROM tool_photo tp WHERE tp.tool_id = t.tool_id LIMIT 1) AS tool_photo_key,
                (SELECT COUNT(cm.message_id) FROM chat_message cm
                 WHERE cm.room_id = cr.room_id AND cm.sender_id != cp_me.user_id
                 AND cm.created_at > cp_me.last_read_at) AS unread_count
            FROM chat_room cr
            JOIN chat_participant cp_me ON cr.room_id = cp_me.room_id AND cp_me.user_id = :userId
            JOIN chat_participant cp_other ON cr.room_id = cp_other.room_id AND cp_other.user_id != :userId
            JOIN user u_other ON cp_other.user_id = u_other.user_id
            JOIN rental r ON cr.rental_id = r.rental_id
            JOIN tool t ON r.tool_id = t.tool_id
            WHERE cr.room_id = :roomId
        """, Tuple.class)
            .setParameter("userId", currentUserId)
            .setParameter("roomId", roomId)
            .getResultList();

        if (results.isEmpty()) return null;

        Tuple t = results.get(0);
        return ChatRoomDTO.builder()
                .roomId(t.get("room_id", Number.class).longValue())
                .toolId(t.get("tool_id", Number.class).longValue())
                .toolName(t.get("tool_name", String.class))
                .otherUserName(t.get("other_user_name", String.class))
                .otherUserPhoto(t.get("other_user_photo", String.class))
                .toolPhotoKey(t.get("tool_photo_key", String.class))
                .unreadCount(t.get("unread_count", Number.class) != null ?
                        t.get("unread_count", Number.class).longValue() : 0L)
                .build();
    }
}