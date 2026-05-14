package com.toolloop.resource;

import com.toolloop.model.annotations.Authenticated;
import com.toolloop.model.dto.ChatMessageRequest;
import com.toolloop.service.ChatService;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;

@Authenticated
@Path("/chats")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class ChatResource {

    @Inject
    ChatService chatService;

    @GET()
    public Response getRoomsByUser(@Context SecurityContext securityContext) {
        return chatService.getRoomsByUser(securityContext);
    }

    @GET
    @Path("/unread")
    public Response getTotalUnreadMessages(@Context SecurityContext securityContext) {
        return chatService.countTotalUnreadMessages(securityContext);
    }

    @GET
    @Path("/{roomId}/messages")
    public Response getMessages(@Context SecurityContext securityContext, @PathParam("roomId") Long roomId) {
        return chatService.getMessages(securityContext, roomId);
    }

    @POST
    @Path("/rental/{rentalId}")
    public Response getOrCreateByRental(@PathParam("rentalId") Long rentalId) {
        return chatService.getOrCreateRoomForRental(rentalId);
    }

    @POST
    @Path("/{roomId}/messages")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response sendMessage(
            @Context SecurityContext securityContext,
            @PathParam("roomId") Long roomId,
            ChatMessageRequest request) {
        return chatService.sendMessage(securityContext, roomId, request);
    }

    @POST
    @Path("/{roomId}/read")
    public Response markAsRead(
            @Context SecurityContext securityContext,
            @PathParam("roomId") Long roomId) {
        return chatService.markMessagesAsRead(securityContext, roomId);
    }

}
