package com.toolloop.service;

import com.toolloop.model.dto.*;
import com.toolloop.model.entity.ChatMessage;
import com.toolloop.repository.ChatMessageRepository;
import com.toolloop.repository.ChatParticipantRepository;
import com.toolloop.repository.ChatRoomRepository;
import com.toolloop.resource.websocket.WebSocketManager;
import com.toolloop.util.ContextUtils;
import com.toolloop.util.S3KeyResolver;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.transaction.Transactional;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.time.LocalDateTime;
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

    @Inject
    WebSocketManager webSocketManager;

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

    @Transactional
    public Response sendMessage(SecurityContext securityContext, Long roomId, ChatMessageRequest request) {
        Long currentUserId = contextUtils.getUserId(securityContext);

        if (!chatParticipantRepository.isParticipant(roomId, currentUserId)) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        ChatMessage entity = new ChatMessage();
        entity.roomId = roomId;
        entity.senderId = currentUserId;
        entity.messageText = request.message();
        chatMessageRepository.persist(entity);

        LocalDateTime now = LocalDateTime.now();

        ChatMessageDTO myMessage = ChatMessageDTO.builder()
                .messageId(entity.messageId)
                .roomId(roomId)
                .text(entity.messageText)
                .createdAt(now)
                .isMine(true)
                .build();

        Long otherUserId = chatParticipantRepository.findOtherParticipantId(roomId, currentUserId);
        if (otherUserId != null) {
            ChatMessageDTO theirMessage = ChatMessageDTO.builder()
                    .messageId(entity.messageId)
                    .roomId(roomId)
                    .text(entity.messageText)
                    .createdAt(now)
                    .isMine(false)
                    .build();
            webSocketManager.sendToUser(otherUserId, "chat", theirMessage);
        }

        return Response.ok(HttpBodyResponse.builder()
                .data(myMessage)
                .build()).build();
    }

    public Response markMessagesAsRead(SecurityContext securityContext, Long roomId) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        chatParticipantRepository.markAsRead(roomId, currentUserId);
        return Response.ok().build();
    }
}