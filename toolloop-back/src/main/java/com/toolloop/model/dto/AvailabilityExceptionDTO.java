package com.toolloop.model.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Builder;

import java.time.LocalDate;

@RegisterForReflection
@Builder
public record AvailabilityExceptionDTO(
    LocalDate date
) { }