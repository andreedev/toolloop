package com.toolloop.resource;

import com.toolloop.model.annotations.Authenticated;
import com.toolloop.model.dto.GenericInitialRentalRequest;
import com.toolloop.model.enums.RentalStatus;
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
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class RentalResource {

    @Inject
    RentalService rentalService;

    /**
     * Endpoint to list rentals as owner
     */
    @GET
    @Path("/owner")
    public Response getRentalsAsOwner(@Context SecurityContext securityContext) {
        return rentalService.findByOwner(securityContext);
    }

    /**
     * Endpoint to list rentals as renter
     */
    @GET
    @Path("/renter")
    public Response getRentalsAsRenter(@Context SecurityContext securityContext) {
        return rentalService.findByRenter(securityContext);
    }

    @GET
    @Path("/{rentalId}")
    public Response getRentalDetails(@Context SecurityContext securityContext, @PathParam("rentalId") Long rentalId) {
        return rentalService.getRentalDetails(securityContext, rentalId);
    }

    @POST
    @Path("/preview")
    public Response previewRental(@Context SecurityContext securityContext,GenericInitialRentalRequest request) {
        return rentalService.previewRental(securityContext, request);
    }

    @POST
    @Path("/confirm")
    public Response createRental(@Context SecurityContext securityContext, GenericInitialRentalRequest request) {
     return rentalService.createRental(securityContext, request);
    }

    @PATCH
    @Path("/{rentalId}/confirm")
    public Response confirmRental(@Context SecurityContext securityContext, @PathParam("rentalId") Long rentalId) {
        return rentalService.updateStatus(securityContext, rentalId, RentalStatus.Aprobada);
    }

    @PATCH
    @Path("/{rentalId}/reject")
    public Response rejectRental(@Context SecurityContext securityContext, @PathParam("rentalId") Long rentalId) {
        return rentalService.updateStatus(securityContext, rentalId, RentalStatus.Rechazada);
    }

    @POST
    @Path("/{rentalId}/handover-code")
    public Response generateHandoverCode(@Context SecurityContext securityContext, @PathParam("rentalId") Long rentalId) {
        return rentalService.generateHandoverCode(securityContext, rentalId);
    }

    @POST
    @Path("/{rentalId}/return-code")
    public Response generateReturnCode(@Context SecurityContext securityContext, @PathParam("rentalId") Long rentalId) {
        return rentalService.generateReturnCode(securityContext, rentalId);
    }

}
