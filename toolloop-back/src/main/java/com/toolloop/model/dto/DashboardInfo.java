package com.toolloop.model.dto;

import com.toolloop.model.entity.Rental;
import com.toolloop.model.entity.Tool;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Builder
@RegisterForReflection
@Data
public class DashboardInfo {
    public BigDecimal totalEarnings;
    public Integer totalRentals;
    public Integer totalTools;
    public Integer activeRentals;
    public BigDecimal userRating;
    public Rental nextExpiringRental;
    public List<Tool> recentTools;
}
