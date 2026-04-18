package com.toolloop.model.exception;

import com.toolloop.model.dto.HttpBodyResponse;
import io.quarkus.security.UnauthorizedException;
import javax.enterprise.context.ApplicationScoped;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.ForbiddenException;
import javax.ws.rs.NotAcceptableException;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;
import lombok.extern.slf4j.Slf4j;

@ApplicationScoped
@Provider
@Slf4j
public class ErrorMapper implements ExceptionMapper<Exception> {

    @Override
    public Response toResponse(Exception e) {
        String message = e.getMessage();
        if (e instanceof NotFoundException) {
            return build(Response.Status.NOT_FOUND, message);
        } else if (e instanceof NotAcceptableException) {
            return build(Response.Status.NOT_ACCEPTABLE, message);
        } else if (e instanceof BadRequestException) {
            return build(Response.Status.BAD_REQUEST, message);
        } else if (e instanceof ForbiddenException) {
            return build(Response.Status.FORBIDDEN, message);
        } else if (e instanceof UnauthorizedException) {
            return build(Response.Status.UNAUTHORIZED, message);
        } else {
            log.error(e.getLocalizedMessage(), e);
            return build(Response.Status.INTERNAL_SERVER_ERROR, message);
        }
    }

    public static Response build(Response.Status status, String message) {
        log.error("Error {} {}", status, message);
        return Response.status(status).entity(
                HttpBodyResponse.builder().code(status.getStatusCode()).message(message).build()
        ).build();
    }

}
