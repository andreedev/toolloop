package com.toolloop.resource;

import com.toolloop.model.annotations.Authenticated;
import com.toolloop.model.entity.User;
import com.toolloop.service.UserService;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
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
    @Path("")
    public Response getUserInfo(@Context SecurityContext securityContext) {
        return userService.getUserInfo(securityContext);
    }

    @GET
    @Path("/dashboardInfo")
    public Response getDashboardInfo(@Context SecurityContext securityContext) {
        return userService.getDashboardInfo(securityContext);
    }
}
