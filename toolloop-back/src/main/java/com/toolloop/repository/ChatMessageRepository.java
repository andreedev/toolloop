package com.toolloop.repository;

import com.toolloop.model.entity.ChatMessage;
import com.toolloop.model.entity.ChatParticipant;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;

@Slf4j
@ApplicationScoped
public class ChatMessageRepository extends BaseRepository<ChatMessage> {

    @Override
    protected Class<ChatMessage> getEntityClass() {
        return ChatMessage.class;
    }

}