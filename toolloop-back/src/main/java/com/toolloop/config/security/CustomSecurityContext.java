package com.toolloop.config.security;


import javax.ws.rs.core.SecurityContext;

import java.security.Principal;

public class CustomSecurityContext implements SecurityContext {
    private final String userId;
    private final SecurityContext originalContext;

    public CustomSecurityContext(String userId, SecurityContext originalContext) {
        this.userId = userId;
        this.originalContext = originalContext;
    }

    @Override
    public Principal getUserPrincipal() {
        return () -> userId;
    }

    @Override
    public boolean isUserInRole(String role) {
        return originalContext.isUserInRole(role);
    }

    @Override
    public boolean isSecure() {
        return originalContext.isSecure();
    }

    @Override
    public String getAuthenticationScheme() {
        return originalContext.getAuthenticationScheme();
    }
}
