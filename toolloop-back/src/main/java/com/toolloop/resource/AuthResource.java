package com.toolloop.resource;

import com.toolloop.model.entity.User;
import com.toolloop.model.annotations.Authenticated;
import com.toolloop.service.AuthService;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class AuthResource {

    @Inject
    AuthService authService;

    @POST
    @Path("/signup")
    public Response signupUser(User user) {
        return authService.signupUser(user);
    }

    @POST
    @Path("/login")
    public Response loginUser(User user) {
        return authService.loginUser(user);
    }

    @Authenticated
    @GET
    @Path("/checkSession")
    public Response checkSession() {
        return Response.ok().build();
    }

}
