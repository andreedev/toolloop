package com.toolloop.model.entity;

import com.toolloop.util.JsonListConverter;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.Instant;
import java.util.List;

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
    private Long reviewId;

    @Column(name = "rental_id", nullable = false)
    private Long rentalId;

    @Column(name = "reviewer_id", nullable = false)
    private Long reviewerId;

    @Column(name = "reviewee_id", nullable = false)
    private Long revieweeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_type", nullable = false)
    private ReviewType reviewType;

    @Column(name = "user_rating", nullable = false)
    private Byte userRating;

    @Convert(converter = JsonListConverter.class)
    @Column(name = "user_tags", columnDefinition = "json")
    private List<String> userTags;

    @Column(name = "tool_rating", nullable = false)
    private Byte toolRating;

    @Convert(converter = JsonListConverter.class)
    @Column(name = "tool_tags", columnDefinition = "json")
    private List<String> toolTags;

    @Column(name = "comment", length = 300)
    private String comment;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private Instant updatedAt;

    public enum ReviewType {
        RENTER_TO_OWNER,
        OWNER_TO_RENTER
    }
}