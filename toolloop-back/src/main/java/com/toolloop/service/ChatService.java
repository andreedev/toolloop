package com.toolloop.service;

import com.toolloop.model.dto.ChatMessageRequest;
import com.toolloop.model.entity.VerificationCode;
import com.toolloop.model.enums.VerificationCodeType;
import com.toolloop.repository.ChatRoomRepository;
import com.toolloop.repository.VerificationCodeRepository;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.transaction.Transactional;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@ApplicationScoped
public class ChatService {

    @Inject
    ChatRoomRepository chatRoomRepository;

    public Response listRoomsForUser(SecurityContext sc) {
        return null;
    }

    public Response getMessages(Long roomId) {
        return null;
    }

    public Response getOrCreateRoomForRental(SecurityContext sc, Long rentalId) {
        return null;
    }

    public Response sendMessage(SecurityContext sc, Long roomId, ChatMessageRequest request) {
        return null;
    }
}