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

    @Override
    protected Class<ChatParticipant> getEntityClass() {
        return ChatParticipant.class;
    }

}