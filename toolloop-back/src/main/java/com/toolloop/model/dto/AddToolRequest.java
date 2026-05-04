package com.toolloop.model.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import java.math.BigDecimal;
import java.util.List;

@RegisterForReflection
public record AddToolRequest(
    String name,
    String description,
    BigDecimal pricePerDay,
    BigDecimal securityDeposit,
    Long categoryId,
    String condition,
    List<String> photoKeys,
    ToolAvailabilityDTO availability
) { }
