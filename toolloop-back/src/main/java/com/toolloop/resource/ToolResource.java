package com.toolloop.resource;

import com.toolloop.model.annotations.Authenticated;
import com.toolloop.model.dto.AddToolRequest;
import com.toolloop.model.dto.MapToolsRequest;
import com.toolloop.model.dto.UpdateToolRequest;
import com.toolloop.service.ToolAvailabilityService;
import com.toolloop.service.ToolService;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.*;
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

    @Inject
    ToolAvailabilityService toolAvailabilityService;

    @GET
    @Path("/{toolId}")
    public Response getToolDetails(@Context SecurityContext securityContext, @PathParam("toolId") String toolId) {
        return toolService.getToolDetails(securityContext, toolId);
    }

    @POST
    @Path("/add")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response addTool(@Context SecurityContext securityContext, AddToolRequest request) {
        return toolService.addTool(securityContext, request);
    }

    @PUT
    @Path("/{toolId}/update")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateTool(
            @Context SecurityContext securityContext,
            @PathParam("toolId") Long toolId,
            UpdateToolRequest request
    ) {
        return toolService.updateTool(securityContext, toolId, request);
    }

    @GET
    @Path("/user-tools")
    public Response getUserTools(@Context SecurityContext securityContext) {
        return toolService.getUserTools(securityContext);
    }

    @POST
    @Path("/map")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response getToolsForMap(@Context SecurityContext securityContext, MapToolsRequest request) {
        return toolService.getToolsForMap(securityContext, request);
    }

    @GET
    @Path("/{toolId}/availability")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getToolAvailability(
            @PathParam("toolId") Long toolId,
            @QueryParam("period") String period  // "2026-04"
    ) {
        return toolAvailabilityService.getToolAvailability(toolId, period);
    }
}
