package com.toolloop.util;

import io.quarkus.security.UnauthorizedException;

import javax.enterprise.context.ApplicationScoped;
import java.util.Optional;

@ApplicationScoped
public class HeaderUtils {

    public String extractBearerToken(String authorizationHeader) {
        String header = Optional.ofNullable(authorizationHeader)
                .orElseThrow(() -> new UnauthorizedException("Authorization header is missing"));

        if (header.trim().isEmpty()) {
            throw new UnauthorizedException("Authorization header cannot be empty");
        }

        if (!header.startsWith("Bearer ")) {
            throw new UnauthorizedException("Authorization header must start with 'Bearer '");
        }

        String token = header.substring("Bearer ".length()).trim();
        if (token.isEmpty()) {
            throw new UnauthorizedException("Bearer token cannot be empty");
        }
        return token;
    }
}
