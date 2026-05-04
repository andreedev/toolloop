package com.toolloop.model.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@RegisterForReflection
@Data
public class ToolCalendarResponseDTO {
    private String ruleType;
    private List<LocalDate> exceptions;
    private List<ToolCalendarDayDTO> days;
}