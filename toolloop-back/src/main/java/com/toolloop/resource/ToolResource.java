package com.toolloop.resource;

import com.toolloop.model.annotations.Authenticated;
import com.toolloop.service.ToolService;
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
@Path("/tool")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class ToolResource {

    @Inject
    ToolService toolService;

    @GET
    @Path("/{toolId}")
    public Response getToolDetails(@Context SecurityContext securityContext, @PathParam("toolId") String toolId) {
        return toolService.getToolDetails(securityContext, toolId);
    }

    @GET
    @Path("/user-tools")
    public Response getUserTools(@Context SecurityContext securityContext) {
        return toolService.getUserTools(securityContext);
    }
}
