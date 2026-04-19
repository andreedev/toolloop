package com.toolloop.resource;

import com.toolloop.service.PostalCodeGeoService;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


@Path("/postalCodeGeo")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class PostalCodeGeoResource {

    @Inject
    PostalCodeGeoService postalCodeGeoService;

    @GET
    @Path("/")
    public Response listAllPostalCodes() {
        return postalCodeGeoService.listAllPostalCodes();
    }

    @GET
    @Path("/search")
    public Response searchPostalCodes(@QueryParam("query") String query) {
        return postalCodeGeoService.searchPostalCodes(query);
    }
}