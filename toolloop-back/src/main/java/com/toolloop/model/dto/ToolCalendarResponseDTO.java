package com.toolloop.model.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ToolCalendarResponseDTO {
    private String ruleType;
    private List<LocalDate> exceptions;
    private List<ToolCalendarDayDTO> days;
}