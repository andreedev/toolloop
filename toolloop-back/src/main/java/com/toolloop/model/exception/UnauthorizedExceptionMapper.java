package com.toolloop.model.exception;

import io.quarkus.security.UnauthorizedException;
import javax.enterprise.context.ApplicationScoped;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;
import lombok.extern.slf4j.Slf4j;

@ApplicationScoped
@Provider
@Slf4j
public class UnauthorizedExceptionMapper implements ExceptionMapper<UnauthorizedException> {

    @Override
    public Response toResponse(UnauthorizedException e) {
        return ErrorMapper.build(Response.Status.UNAUTHORIZED, e.getMessage());
    }
}
