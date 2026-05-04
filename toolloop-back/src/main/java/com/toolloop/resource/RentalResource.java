package com.toolloop.resource;

import com.toolloop.model.annotations.Authenticated;
import com.toolloop.model.dto.GenericInitialRentalRequest;
import com.toolloop.service.RentalService;
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
@Path("/rental")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class RentalResource {

    @Inject
    RentalService rentalService;

    @POST
    @Path("/preview")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response previewRental(@Context SecurityContext securityContext,GenericInitialRentalRequest request) {
        return rentalService.previewRental(securityContext, request);
    }

    @POST
    @Path("/confirm")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createRental(@Context SecurityContext securityContext, GenericInitialRentalRequest request) {
     return rentalService.createRental(securityContext, request);
    }

}
