package com.toolloop.model.dto;

import com.toolloop.model.enums.DayStatus;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@RegisterForReflection
@Data
@AllArgsConstructor
public class ToolCalendarDayDTO {
    private LocalDate date;
    private DayStatus status;
}
