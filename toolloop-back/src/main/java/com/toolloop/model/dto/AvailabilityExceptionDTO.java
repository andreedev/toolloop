package com.toolloop.model.dto;

import java.time.LocalDate;

public record AvailabilityExceptionDTO(
    LocalDate date,
    boolean isAvailable
) { }