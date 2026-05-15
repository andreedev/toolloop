package com.toolloop.resource;

import com.toolloop.model.annotations.Authenticated;
import com.toolloop.service.UserService;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
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
    public Response getPublicProfile(@PathParam("userId") Long userId) {
        return userService.getPublicProfile(userId);
    }
}
