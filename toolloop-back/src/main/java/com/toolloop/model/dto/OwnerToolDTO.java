package com.toolloop.model.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@RegisterForReflection
public class OwnerToolDTO {
    private Long toolId;
    private String name;
    private BigDecimal pricePerDay;
    private String firstPhotoKey;
    private boolean isAvailable;
}