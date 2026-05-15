package com.toolloop.model.entity;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RegisterForReflection
@Entity
@Table(name = "email_verification_token")
public class EmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "user_id", nullable = false)
    public Long userId;

    @Column(name = "token", nullable = false, unique = true, length = 36)
    public String token;

    @Column(name = "expires_at", nullable = false)
    public Instant expiresAt;

    @Column(name = "used_at")
    public Instant usedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    public Instant createdAt;
}
