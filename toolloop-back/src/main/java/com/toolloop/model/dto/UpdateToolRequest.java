package com.toolloop.model.dto;

import java.math.BigDecimal;
import java.util.List;

public record UpdateToolRequest(
    String name,
    String description,
    BigDecimal pricePerDay,
    BigDecimal securityDeposit,
    Long categoryId,
    String condition,
    List<String> photoKeys,
    ToolAvailabilityDTO availability
) { }
