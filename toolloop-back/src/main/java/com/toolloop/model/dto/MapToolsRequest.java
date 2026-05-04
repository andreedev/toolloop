package com.toolloop.model.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Builder;

import java.math.BigDecimal;

@RegisterForReflection
@Builder
public record MapToolsRequest(
        String name,
        Long categoryId,
        BigDecimal maxPricePerDay
) {}
