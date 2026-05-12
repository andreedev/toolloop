package com.toolloop.service;

import com.toolloop.model.dto.*;
import com.toolloop.repository.ChatMessageRepository;
import com.toolloop.repository.ChatParticipantRepository;
import com.toolloop.repository.ChatRoomRepository;
import com.toolloop.util.ContextUtils;
import com.toolloop.util.S3KeyResolver;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.transaction.Transactional;
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

    public Response countTotalUnreadMessages(SecurityContext securityContext) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        Long unreadCount = chatMessageRepository.countTotalUnreadMessages(currentUserId);
        return Response.ok(HttpBodyResponse.builder()
                .data(unreadCount)
                .build()).build();
    }

    @Transactional
    public Response getMessages(SecurityContext securityContext, Long roomId) {
        Long currentUserId = contextUtils.getUserId(securityContext);

//        chatParticipantRepository.markAsRead(roomId, currentUserId);

        ChatRoomDTO roomDetails = chatRoomRepository.getRoomDetails(roomId, currentUserId);
        if (roomDetails != null) {
            roomDetails.setOtherUserPhoto(s3KeyResolver.toUrlOrNull(roomDetails.getOtherUserPhoto()));
            roomDetails.setToolPhotoKey(s3KeyResolver.toUrlOrNull(roomDetails.getToolPhotoKey()));
        }

        List<ChatMessageDTO> messages = chatMessageRepository.findMessagesByRoom(roomId, currentUserId);

        ChatViewDTO viewResponse = ChatViewDTO.builder()
                .roomDetails(roomDetails)
                .messages(messages)
                .build();

        return Response.ok(HttpBodyResponse.builder()
                .data(viewResponse)
                .build()).build();
    }

    public Response getOrCreateRoomForRental(SecurityContext securityContext, Long rentalId) {
        return null;
    }

    public Response sendMessage(SecurityContext securityContext, Long roomId, ChatMessageRequest request) {
        return null;
    }
}