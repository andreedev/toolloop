package com.toolloop.model.dto;

import java.util.List;

public record ToolAvailabilityDTO(
    String ruleType,
    List<AvailabilityExceptionDTO> exceptions
) { }
