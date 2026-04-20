package com.toolloop.util;


import javax.enterprise.context.RequestScoped;
import javax.ws.rs.core.SecurityContext;

@RequestScoped
public class ContextUtils {

    public Long getUserId(SecurityContext securityContext) {
        if (securityContext == null || securityContext.getUserPrincipal() == null) {
            return null;
        }
        String subject = securityContext.getUserPrincipal().getName();
        return subject != null ? Long.valueOf(subject) : null;
    }
}
