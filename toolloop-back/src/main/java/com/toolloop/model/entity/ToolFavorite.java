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
@Table(name = "tool_favorite", uniqueConstraints = {
        @UniqueConstraint(name = "unique_favorite", columnNames = {"user_id", "tool_id"})
})
public class ToolFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tool_favorite_id")
    public Long toolFavoriteId;

    @Column(name = "user_id", nullable = false)
    public Long userId;

    @Column(name = "tool_id", nullable = false)
    public Long toolId;

    @Column(name = "created_at", insertable = false, updatable = false)
    public Instant createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    public Instant updatedAt;
}
