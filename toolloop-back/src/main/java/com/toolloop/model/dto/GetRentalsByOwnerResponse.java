package com.toolloop.model.dto;

import com.toolloop.model.entity.Rental;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Builder;

import java.util.List;

@RegisterForReflection
@Builder
public record GetRentalsByOwnerResponse(
    int totalPendingRentals,
    int totalInUseRentals,
    List<Rental> rentals
) { }
