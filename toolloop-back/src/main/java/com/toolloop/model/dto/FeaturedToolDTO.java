package com.toolloop.model.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@RegisterForReflection
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeaturedToolDTO {
    public Long toolId;
    public String name;
    public String photoUrl;
    public BigDecimal pricePerDay;
    public Boolean isAvailable;
}
