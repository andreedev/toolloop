package com.toolloop.repository;

import com.toolloop.model.entity.VerificationCode;
import com.toolloop.model.enums.VerificationCodeType;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import java.time.Instant;
import java.util.Optional;

@Slf4j
@ApplicationScoped
public class ChatRoomRepository {

    @Inject
    EntityManager em;

    public void persist(VerificationCode verificationCode) {
        em.persist(verificationCode);
    }


}