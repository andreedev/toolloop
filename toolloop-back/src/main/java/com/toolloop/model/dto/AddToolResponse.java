package com.toolloop.model.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Builder;

import java.util.List;

@RegisterForReflection
@Builder
public record AddToolResponse(
    Long toolId,
    List<String> preSignedUrls
) { }
