package com.toolloop.config.security;

import com.toolloop.model.entity.SessionToken;
import com.toolloop.model.annotations.Authenticated;
import com.toolloop.repository.TokenRepository;
import com.toolloop.util.HeaderUtils;
import io.quarkus.security.UnauthorizedException;
import javax.annotation.Priority;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.Priorities;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.SecurityContext;
import javax.ws.rs.ext.Provider;

import java.time.Instant;

@Provider
@Priority(Priorities.AUTHENTICATION)
@ApplicationScoped
@Authenticated
public class TokenInterceptor implements ContainerRequestFilter {

    @Inject
    TokenRepository tokenRepository;

    @Inject
    HeaderUtils headerUtils;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if ("OPTIONS".equalsIgnoreCase(requestContext.getMethod())) {
            return;
        }

        String authorizationHeader = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);
        String tokenValue = headerUtils.extractBearerToken(authorizationHeader);
        SessionToken sessionToken = tokenRepository.findByTokenValue(tokenValue)
                .orElseThrow(() -> new UnauthorizedException("Invalid token"));

        if (sessionToken.getExpiresAt().isBefore(Instant.now())) {
            throw new UnauthorizedException("Token has expired");
        }

        String userId = sessionToken.getUserId().toString();

        SecurityContext originalContext = requestContext.getSecurityContext();
        CustomSecurityContext customContext = new CustomSecurityContext(userId, originalContext);
        requestContext.setSecurityContext(customContext);
    }
}
