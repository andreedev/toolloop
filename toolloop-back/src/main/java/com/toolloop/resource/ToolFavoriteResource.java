package com.toolloop.resource;

import com.toolloop.model.annotations.Authenticated;
import com.toolloop.model.dto.AddToolRequest;
import com.toolloop.model.dto.MapToolsRequest;
import com.toolloop.model.dto.UpdateToolRequest;
import com.toolloop.service.ToolAvailabilityService;
import com.toolloop.service.ToolFavoriteService;
import com.toolloop.service.ToolService;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;


@Authenticated
@Path("/toolFavorite")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class ToolFavoriteResource {

    @Inject
    ToolFavoriteService toolFavoriteService;

    @POST
    @Path("/toggle/{toolId}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response toggleToolFavorite(@Context SecurityContext securityContext, @PathParam("toolId") Long toolId) {
        return toolFavoriteService.toggleToolFavorite(securityContext, toolId);
    }
}
