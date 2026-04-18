package com.toolloop.model.entity;

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

    @Column(name = "price_per_day_at_rental", nullable = false, precision = 10, scale = 2)
    public BigDecimal pricePerDayAtRental;

    @Column(name = "total_rental_price", nullable = false, precision = 10, scale = 2)
    public BigDecimal totalRentalPrice;

    @Column(name = "security_deposit_at_rental", nullable = false, precision = 10, scale = 2)
    public BigDecimal securityDepositAtRental;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "ENUM('Pendiente', 'Rechazada', 'Aprobada', 'En_Uso', 'Completada')", nullable = false)
    public RentalStatus status = RentalStatus.Pendiente;

    @Column(name = "created_at", insertable = false, updatable = false)
    public Instant createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    public Instant updatedAt;

    public enum RentalStatus {
        Pendiente, Rechazada, Aprobada, En_Uso, Completada
    }
}
