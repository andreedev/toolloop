package com.toolloop.model.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public record VerifyCodeRequest(String code) {
}
