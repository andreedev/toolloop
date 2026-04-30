package com.toolloop.model.dto;

import com.toolloop.model.enums.DayStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class ToolCalendarDayDTO {
    private LocalDate date;
    private DayStatus status;
}
