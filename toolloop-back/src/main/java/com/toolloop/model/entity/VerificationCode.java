package com.toolloop.model.entity;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.Instant;

@RegisterForReflection
@Data
@NoArgsConstructor
@Entity
@Table(name = "verification_code")
public class VerificationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "verification_code_id")
    public Long verificationCodeId;

    @Column(name = "rental_id", nullable = false)
    public Long rentalId;

    @Column(name = "code", nullable = false, length = 6)
    public String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, columnDefinition = "ENUM('RECOGIDA', 'DEVOLUCION')")
    public CodeType type;

    @Column(name = "expires_at", nullable = false)
    public Instant expiresAt;

    @Column(name = "used_at")
    public Instant usedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    public Instant createdAt;

    public enum CodeType {
        RECOGIDA, DEVOLUCION
    }
}
