package com.toolloop.model.entity;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@RegisterForReflection
@Data
@NoArgsConstructor
@Entity
@Table(name = "tool_availability_exception", uniqueConstraints = {
        @UniqueConstraint(name = "unique_tool_date", columnNames = {"tool_id", "date"})
})
public class ToolAvailabilityException {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "availability_exception_id")
    public Long availabilityExceptionId;

    @Column(name = "tool_id", nullable = false)
    public Long toolId;

    @Column(name = "date", nullable = false)
    public LocalDate date;

    @Column(name = "is_available", nullable = false)
    public Boolean isAvailable;

}
