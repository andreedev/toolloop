package com.toolloop.model.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@RegisterForReflection
@Data
@NoArgsConstructor
@Entity
@Table(name = "rental")
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rental_id")
    public Long rentalId;

    @Column(name = "tool_id", nullable = false)
    public Long toolId;

    @Column(name = "renter_id", nullable = false)
    public Long renterId;

    @Column(name = "start_date", nullable = false)
    public LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    public LocalDate endDate;

    @Column(name = "daily_rate", nullable = false, precision = 10, scale = 2)
    public BigDecimal dailyRate;

    @Column(name = "subtotal_amount", nullable = false, precision = 10, scale = 2)
    public BigDecimal subtotalAmount;

    @Column(name = "deposit_amount", nullable = false, precision = 10, scale = 2)
    public BigDecimal depositAmount;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    public BigDecimal totalAmount;

    @Column(name = "total_days", nullable = false)
    public Integer totalDays;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "ENUM('Pendiente', 'Rechazada', 'Aprobada', 'En_Uso', 'Completada')", nullable = false)
    public RentalStatus status = RentalStatus.Pendiente;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "created_at", insertable = false, updatable = false)
    public Instant createdAt;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "updated_at", insertable = false, updatable = false)
    public Instant updatedAt;

    public enum RentalStatus {
        Pendiente, Rechazada, Aprobada, En_Uso, Completada
    }

    @Transient
    public Tool tool;

    @Transient
    public Long daysRemaining;

    public void calculateDaysRemaining() {
        if (this.endDate != null) {
            this.daysRemaining = (long) LocalDate.now().until(this.endDate).getDays();
        }
    }
}
