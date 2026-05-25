package com.toolloop.model.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public record UpdatePasswordRequest(
    String currentPassword,
    String newPassword
) { }
