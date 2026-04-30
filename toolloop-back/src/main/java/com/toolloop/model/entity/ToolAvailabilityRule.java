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
@Table(name = "tool_availability_rule")
public class ToolAvailabilityRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rule_id")
    public Long ruleId;

    @Column(name = "tool_id", nullable = false)
    public Long toolId;

    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", nullable = false, columnDefinition = "ENUM('Siempre', 'Lunes_a_Viernes', 'Fines_de_semana', 'No_disponible')")
    public ToolAvailabilityRule.RuleType ruleType;

    @Column(name = "created_at", insertable = false, updatable = false)
    public Instant createdAt;

    public enum RuleType{
        Siempre, Lunes_a_Viernes, Fines_de_semana, No_disponible
    }
}
