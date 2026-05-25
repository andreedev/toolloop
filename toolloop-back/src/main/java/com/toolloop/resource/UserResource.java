package com.toolloop.resource;

import com.toolloop.model.annotations.Authenticated;
import com.toolloop.model.dto.UpdateProfilePhotoRequest;
import com.toolloop.model.dto.UpdateUserAvailabilityDescriptionRequest;
import com.toolloop.service.UserService;

import com.toolloop.model.entity.UserNotificationConfig;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;


@Authenticated
@Path("/user")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class UserResource {

    @Inject
    UserService userService;

    @GET
    public Response getUserInfo(@Context SecurityContext securityContext) {
        return userService.getUserInfo(securityContext);
    }

    @GET
    @Path("/dashboard-info")
    public Response getDashboardInfo(@Context SecurityContext securityContext) {
        return userService.getDashboardInfo(securityContext);
    }

    @GET
    @Path("{userId}/public-profile")
    public Response getPublicProfile(@PathParam("userId") Long userId, @Context SecurityContext securityContext) {
        return userService.getPublicProfile(userId, securityContext);
    }

    @PUT
    @Path("/notification-config")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateNotificationConfig(@Context SecurityContext securityContext, UserNotificationConfig config) {
        return userService.updateNotificationConfig(securityContext, config);
    }

    @PUT
    @Path("/availability-description")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateAvailabilityDescription(@Context SecurityContext securityContext, UpdateUserAvailabilityDescriptionRequest request) {
        return userService.updateAvailabilityDescription(securityContext, request);
    }

    @PUT
    @Path("/profile-photo")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateProfilePhoto(@Context SecurityContext securityContext, UpdateProfilePhotoRequest request) {
        return userService.updateProfilePhoto(securityContext, request);
    }

    @POST
    @Path("/block/{blockedId}")
    public Response blockUser(@Context SecurityContext securityContext, @PathParam("blockedId") Long blockedId) {
        return userService.blockUser(securityContext, blockedId);
    }

    @DELETE
    @Path("/block/{blockedId}")
    public Response unblockUser(@Context SecurityContext securityContext, @PathParam("blockedId") Long blockedId) {
        return userService.unblockUser(securityContext, blockedId);
    }

}
