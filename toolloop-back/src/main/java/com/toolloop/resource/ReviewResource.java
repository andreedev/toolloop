package com.toolloop.resource;

import com.toolloop.model.annotations.Authenticated;
import com.toolloop.model.dto.GenericInitialRentalRequest;
import com.toolloop.model.dto.VerifyCodeRequest;
import com.toolloop.model.entity.Review;
import com.toolloop.model.enums.RentalStatus;
import com.toolloop.model.enums.VerificationCodeType;
import com.toolloop.service.RentalService;
import com.toolloop.service.ReviewService;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;

@Authenticated
@Path("/review")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class ReviewResource {

    @Inject
    ReviewService reviewService;

    @GET
    @Path("/review/context/{rentalId}")
    public Response getReviewContext(@PathParam("rentalId") Long rentalId, @Context SecurityContext securityContext) {
        return reviewService.getReviewContext(rentalId, securityContext);
    }

    @POST
    public Response submitReview(@Context SecurityContext securityContext, Review review) {
        return reviewService.submitReview(securityContext, review);
    }

}
