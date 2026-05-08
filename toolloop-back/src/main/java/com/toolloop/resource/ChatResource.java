package com.toolloop.resource;

import com.toolloop.model.dto.ChatMessageRequest;
import com.toolloop.service.ChatService;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;

@Path("/chat")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class ChatResource {

    @Inject
    ChatService chatService;

    @GET
    public Response getMyRooms(@Context SecurityContext sc) {
        return chatService.listRoomsForUser(sc);
    }

    @GET
    @Path("/{roomId}/messages")
    public Response getMessages(@PathParam("roomId") Long roomId) {
        return chatService.getMessages(roomId);
    }

    @GET
    @Path("/rental/{rentalId}")
    public Response getOrCreateByRental(@Context SecurityContext sc, @PathParam("rentalId") Long rentalId) {
        return chatService.getOrCreateRoomForRental(sc, rentalId);
    }

    @POST
    @Path("/{roomId}/messages")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response sendMessage(
            @Context SecurityContext sc,
            @PathParam("roomId") Long roomId,
            ChatMessageRequest request) {
        return chatService.sendMessage(sc, roomId, request);
    }

}
