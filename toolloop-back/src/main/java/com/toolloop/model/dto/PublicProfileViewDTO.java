package com.toolloop.model.dto;

import com.toolloop.model.entity.Review;
import com.toolloop.model.entity.Tool;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@RegisterForReflection
public class PublicProfileViewDTO {
    private Long userId;
    private String name;
    private String postalCode;
    private String profilePhotoKey;
    private String availabilityDescription;
    private Instant memberSince;
    private BigDecimal averageRatingAsOwner;
    private BigDecimal averageRatingAsRenter;
    private Long totalReviewsAsOwner;
    private Long totalReviewsAsRenter;
    private List<OwnerToolDTO> availableTools;
    private List<Review> reviews;
}