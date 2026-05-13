package com.toolloop.resource;

import com.toolloop.model.annotations.Authenticated;
import com.toolloop.model.dto.GenericInitialRentalRequest;
import com.toolloop.model.dto.VerifyCodeRequest;
import com.toolloop.model.enums.RentalStatus;
import com.toolloop.model.enums.VerificationCodeType;
import com.toolloop.service.NotificationService;
import com.toolloop.service.RentalService;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;

@Authenticated
@Path("/notifications")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class NotificationResource {

    @Inject
    NotificationService notificationService;

    @GET
    public Response getNotifications(@Context SecurityContext securityContext) {
        return notificationService.getNotificationsByUserId(securityContext);
    }

    @POST
    @Path("{notificationId}/read")
    public Response readNotification(@PathParam("notificationId") long notificationId, @Context SecurityContext securityContext) {
        return notificationService.markNotificationAsRead(securityContext, notificationId);
    }

    @POST
    @Path("mark-all-read")
    public Response markAllNotificationsAsRead(@Context SecurityContext securityContext) {
        return notificationService.markAllNotificationsAsRead(securityContext);
    }

}
