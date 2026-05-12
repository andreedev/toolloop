package com.toolloop.service;

import com.toolloop.model.dto.ChatMessageRequest;
import com.toolloop.model.dto.ChatRoomDTO;
import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.repository.ChatMessageRepository;
import com.toolloop.repository.ChatParticipantRepository;
import com.toolloop.repository.ChatRoomRepository;
import com.toolloop.util.ContextUtils;
import com.toolloop.util.S3KeyResolver;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.util.List;

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

    @Inject
    S3KeyResolver s3KeyResolver;

    public Response getRoomsByUser(SecurityContext securityContext) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        List<ChatRoomDTO> chatRooms = chatRoomRepository.listRoomsByUser(currentUserId);
        chatRooms.forEach(chatRoom -> {
            chatRoom.setOtherUserPhoto(s3KeyResolver.toUrlOrNull(chatRoom.getOtherUserPhoto()));
            chatRoom.setToolPhotoKey(s3KeyResolver.toUrlOrNull(chatRoom.getToolPhotoKey()));
        });
        return Response.ok(HttpBodyResponse.builder()
                .data(chatRooms)
                .build()).build();
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