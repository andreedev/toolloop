package com.toolloop.repository;

import com.toolloop.model.entity.ChatRoom;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import java.util.List;

@Slf4j
@ApplicationScoped
public class ChatRoomRepository extends BaseRepository<ChatRoom>{

    @Override
    protected Class<ChatRoom> getEntityClass() {
        return ChatRoom.class;
    }

    public List<ChatRoom> listRoomsByUser(Long currentUserId) {
        return em.createNativeQuery()
    }
}