package com.toolloop.model.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
@AllArgsConstructor
@NoArgsConstructor
@Builder
@RegisterForReflection
@Data
@Entity
@Table(name = "user_block")
public class UserBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "blocker_id", nullable = false)
    public Long blockerId;

    @Column(name = "blocked_id", nullable = false)
    public Long blockedId;

    @Column(name = "created_at", insertable = false, updatable = false)
    public Instant createdAt;
}