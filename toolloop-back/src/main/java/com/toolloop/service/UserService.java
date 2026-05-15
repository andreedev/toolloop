package com.toolloop.service;

import com.toolloop.model.dto.DashboardInfo;
import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.model.dto.PublicProfileViewDTO;
import com.toolloop.model.entity.Rental;
import com.toolloop.model.entity.Review;
import com.toolloop.model.entity.Tool;
import com.toolloop.model.entity.User;
import com.toolloop.model.enums.ReviewType;
import com.toolloop.repository.RentalRepository;
import com.toolloop.repository.ReviewRepository;
import com.toolloop.repository.ToolRepository;
import com.toolloop.repository.UserRepository;
import com.toolloop.util.ContextUtils;
import com.toolloop.util.S3KeyResolver;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Slf4j
@ApplicationScoped
public class UserService {

    @Inject
    UserRepository userRepository;

    @Inject
    RentalRepository rentalRepository;

    @Inject
    ToolRepository toolRepository;

    @Inject
    ReviewRepository reviewRepository;

    @Inject
    ContextUtils contextUtils;

    @Inject
    S3KeyResolver s3KeyResolver;

    public Response getUserInfo(SecurityContext securityContext) {
        Long userId = contextUtils.getUserId(securityContext);

        if (userId == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setProfilePhotoKey(s3KeyResolver.toUrlOrNull(user.getProfilePhotoKey()));
            return Response.ok(HttpBodyResponse.builder()
                    .data(user)
                    .build()).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    public Response getDashboardInfo(SecurityContext securityContext) {
        Long userId = contextUtils.getUserId(securityContext);
        BigDecimal totalEarnings = rentalRepository.findTotalEarningsByUserId(userId);
        Integer totalRentals = rentalRepository.countByRenterId(userId);
        Integer totalTools = toolRepository.countByOwnerId(userId);
        Integer activeRentals = rentalRepository.countActiveRentalsByRenterId(userId);
        BigDecimal userRating = reviewRepository.findAverageUserGeneralRating(userId);
        Optional<Rental> nextExpiringRental = rentalRepository.findNextExpiringRentalByRenterId(userId);
        nextExpiringRental.ifPresent(Rental::calculateDaysRemaining);
        List<Tool> recentTools = toolRepository.findRecentToolsByOwnerIdWithFirstPhoto(userId, 2);

        DashboardInfo dashboardInfo = DashboardInfo.builder()
                .totalEarnings(totalEarnings)
                .totalRentals(totalRentals)
                .totalTools(totalTools)
                .activeRentals(activeRentals)
                .userRating(userRating)
                .nextExpiringRental(nextExpiringRental.orElse(null))
                .recentTools(recentTools)
                .build();

        return Response.ok(HttpBodyResponse.builder()
                .data(dashboardInfo)
                .build()).build();
    }

    public Response getPublicProfile(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new WebApplicationException("Usuario no encontrado", Response.Status.NOT_FOUND));

        List<Review> reviews = reviewRepository.findByRevieweeId(userId);
        reviews.stream().forEach(review -> {
            User reviewer = userRepository.findById(review.getReviewerId()).get();
            review.reviewer = User.builder()
                .id(reviewer.getId())
                .name(reviewer.getName())
                .averageRating(reviewRepository.findAverageUserGeneralRating(reviewer.getId()))
                .profilePhotoKey(s3KeyResolver.toUrlOrNull(reviewer.getProfilePhotoKey()))
                .build();
        });

        Long totalReviewsAsOwner = reviews.stream().filter(review -> review.getReviewType() == ReviewType.RENTER_TO_OWNER).count();
        Long totalReviewsAsRenter = reviews.stream().filter(review -> review.getReviewType() == ReviewType.OWNER_TO_RENTER).count();

        List<Tool> availableTools = toolRepository.findAvailableToolsByOwnerId(userId);
        availableTools.stream().forEach(tool -> {
            tool
        })

        var profile = PublicProfileViewDTO.builder()
                .userId(user.getId())
                .name(user.getName())
                .memberSince(user.getCreatedAt())
                .profilePhotoKey(s3KeyResolver.toUrlOrNull(user.getProfilePhotoKey()))
                .averageRatingAsOwner(reviewRepository.findAverageRatingForUserAsOwner(userId))
                .averageRatingAsRenter(reviewRepository.findAverageRatingForUserAsRenter(userId))
                .totalReviewsAsOwner(totalReviewsAsOwner)
                .totalReviewsAsRenter(totalReviewsAsRenter)
                .availableTools(availableTools)
                .reviews(reviews)
                .build();
        return Response.ok(HttpBodyResponse.builder()
                .data(profile)
                .build()).build();
    }
}
