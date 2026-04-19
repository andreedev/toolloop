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
@Table(name = "review", uniqueConstraints = {
        @UniqueConstraint(name = "unique_rental_reviewer", columnNames = {"rental_id", "reviewer_id"})
})
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    public Long reviewId;

    @Column(name = "rental_id", nullable = false)
    public Long rentalId;

    @Column(name = "reviewer_id", nullable = false)
    public Long reviewerId;

    @Column(name = "reviewee_id", nullable = false)
    public Long revieweeId;

    @Column(name = "rating", nullable = false)
    public Byte rating; // 1–5

    @Column(name = "comment", columnDefinition = "TEXT")
    public String comment;

    @Column(name = "created_at", insertable = false, updatable = false)
    public Instant createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    public Instant updatedAt;
}
