package com.toolloop.resource;

import com.toolloop.service.ToolService;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Slf4j
@Path("/home")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class HomeResource {

    @Inject
    ToolService toolService;

    @GET
    @Path("/featured-tools")
    public Response toolService() {
        return toolService.getFeaturedTools();
    }

}
