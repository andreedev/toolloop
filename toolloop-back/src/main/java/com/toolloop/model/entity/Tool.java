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
@Table(name = "tool")
public class Tool {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tool_id")
    public Long toolId;

    @Column(name = "owner_id", nullable = false)
    public Long ownerId;

    @Column(name = "category_id", nullable = false)
    public Long categoryId;

    @Column(name = "name", nullable = false)
    public String name;

    @Column(name = "description", columnDefinition = "TEXT")
    public String description;

    @Column(name = "price_per_day", nullable = false, precision = 10, scale = 2)
    public BigDecimal pricePerDay;

    @Column(name = "security_deposit", precision = 10, scale = 2)
    public BigDecimal securityDeposit;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition", nullable = false, columnDefinition = "ENUM('Nuevo', 'Excelente', 'Muy_bueno', 'Bueno', 'Aceptable')")
    public ToolCondition condition;

    @Column(name = "created_at", insertable = false, updatable = false)
    public Instant createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    public Instant updatedAt;

    public enum ToolCondition {
        Nuevo, Excelente, Muy_bueno, Bueno, Aceptable
    }

}
