package com.toolloop.model.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Builder;

import java.time.LocalDate;

@RegisterForReflection
@Builder
public record GenericInitialRentalRequest(
    Long toolId,
    LocalDate startDate,
    LocalDate endDate
) {}
