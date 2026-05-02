package com.toolloop.model.dto;

import java.math.BigDecimal;

public record MapToolsRequest(
        String name,
        Long categoryId,
        BigDecimal maxPricePerDay
) {}
