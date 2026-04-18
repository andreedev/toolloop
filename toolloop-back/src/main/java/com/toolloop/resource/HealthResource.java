package com.toolloop.resource;

import io.vertx.core.http.HttpServerRequest;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Slf4j
@Path("/")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class HealthResource {

    @GET
    @Path("/health")
    public Response health(@Context HttpServerRequest request) {
        log.info("Request received: {}", request.uri());
        return Response.ok("up").build();
    }
}
