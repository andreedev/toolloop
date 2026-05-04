package com.toolloop.model.dto;

import java.time.LocalDate;

public record GenericInitialRentalRequest(
    Long toolId,
    LocalDate startDate,
    LocalDate endDate
) {}
