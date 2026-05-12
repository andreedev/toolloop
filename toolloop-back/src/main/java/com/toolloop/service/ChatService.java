package com.toolloop.service;

import com.toolloop.model.dto.ChatMessageRequest;
import com.toolloop.model.entity.ChatRoom;
import com.toolloop.model.entity.User;
import com.toolloop.model.entity.VerificationCode;
import com.toolloop.model.enums.VerificationCodeType;
import com.toolloop.repository.ChatMessageRepository;
import com.toolloop.repository.ChatParticipantRepository;
import com.toolloop.repository.ChatRoomRepository;
import com.toolloop.repository.VerificationCodeRepository;
import com.toolloop.util.ContextUtils;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.transaction.Transactional;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ChatService {

    @Inject
    ChatRoomRepository chatRoomRepository;

    @Inject
    ChatParticipantRepository chatParticipantRepository;

    @Inject
    ChatMessageRepository chatMessageRepository;

    @Inject
    ContextUtils contextUtils;

    public Response listRoomsForUser(SecurityContext securityContext) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        List<ChatRoom> chatRooms = chatRoomRepository.listRoomsByUser(currentUserId);
        return Response.ok().build();
    }

    public Response getMessages(Long roomId) {
        return null;
    }

    public Response getOrCreateRoomForRental(SecurityContext securityContext, Long rentalId) {
        return null;
    }

    public Response sendMessage(SecurityContext securityContext, Long roomId, ChatMessageRequest request) {
        return null;
    }
}