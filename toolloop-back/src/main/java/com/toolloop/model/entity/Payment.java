package com.toolloop.model.entity;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@RegisterForReflection
@Data
@NoArgsConstructor
@Entity
@Table(name = "payment")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    public Long paymentId;

    @Column(name = "rental_id", nullable = false)
    public Long rentalId;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    public BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "concept", nullable = false, columnDefinition = "ENUM('Alquiler', 'Fianza')")
    public PaymentConcept concept;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "ENUM('Pendiente', 'Pagado', 'Devuelto')", nullable = false)
    public PaymentStatus status = PaymentStatus.Pendiente;

    @Column(name = "confirmed_by_owner")
    public Boolean confirmedByOwner = false;

    @Column(name = "confirmed_by_renter")
    public Boolean confirmedByRenter = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    public Instant createdAt;

    public enum PaymentConcept {
        Alquiler, Fianza
    }

    public enum PaymentStatus {
        Pendiente, Pagado, Devuelto
    }
}
