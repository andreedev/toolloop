package com.toolloop.resource;

import com.toolloop.model.annotations.Authenticated;
import com.toolloop.model.dto.AddToolRequest;
import com.toolloop.service.ToolAvailabilityService;
import com.toolloop.service.ToolService;
import com.toolloop.service.UserService;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.time.YearMonth;


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

    @GET
    @Path("/user-tools")
    public Response getUserTools(@Context SecurityContext securityContext) {
        return toolService.getUserTools(securityContext);
    }

    @GET
    @Path("/{toolId}/calendar")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getCalendar(
            @PathParam("toolId") Long toolId,
            @QueryParam("month") String month  // "2026-04"
    ) {
        YearMonth ym = YearMonth.parse(month);
        return Response.ok(toolAvailabilityService.getCalendar(toolId, ym)).build();
    }
}
