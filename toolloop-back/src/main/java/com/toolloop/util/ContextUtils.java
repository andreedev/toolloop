package com.toolloop.util;


import javax.enterprise.context.RequestScoped;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.SecurityContext;

@RequestScoped
public class ContextUtils {

    @Context
    SecurityContext securityContext;

    public Long getUserId() {
        if (securityContext == null || securityContext.getUserPrincipal() == null) {
            return null;
        }
        String subject = securityContext.getUserPrincipal().getName();
        return subject != null ? Long.valueOf(subject) : null;
    }
}
