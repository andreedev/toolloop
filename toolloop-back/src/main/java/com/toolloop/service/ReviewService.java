package com.toolloop.service;

import com.toolloop.model.dto.GenericInitialRentalRequest;
import com.toolloop.model.dto.GetRentalsByOwnerResponse;
import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.model.dto.VerifyCodeRequest;
import com.toolloop.model.entity.Rental;
import com.toolloop.model.entity.Review;
import com.toolloop.model.entity.Tool;
import com.toolloop.model.entity.User;
import com.toolloop.model.enums.RentalStatus;
import com.toolloop.model.enums.ReviewType;
import com.toolloop.model.enums.VerificationCodeType;
import com.toolloop.model.enums.WebSocketEventType;
import com.toolloop.repository.*;
import com.toolloop.resource.websocket.WebSocketManager;
import com.toolloop.resource.websocket.WebSocketResource;
import com.toolloop.util.ContextUtils;
import com.toolloop.util.S3KeyResolver;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.transaction.Transactional;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Slf4j
@ApplicationScoped
public class ReviewService {

    @Inject
    UserRepository userRepository;

    @Inject
    ToolRepository toolRepository;

    @Inject
    NotificationService notificationService;

    @Inject
    VerificationCodeService verificationCodeService;

    @Inject
    ToolPhotoRepository toolPhotoRepository;

    @Inject
    ToolAvailabilityRuleRepository toolAvailabilityRuleRepository;

    @Inject
    ToolAvailabilityExceptionRepository toolAvailabilityExceptionRepository;

    @Inject
    ToolAvailabilityService toolAvailabilityService;

    @Inject
    ReviewRepository reviewRepository;

    @Inject
    RentalRepository rentalRepository;

    @Inject
    ContextUtils contextUtils;

    @Inject
    S3KeyResolver s3KeyResolver;

    public Response getReviewContext(Long rentalId, SecurityContext securityContext) {
        Long currentUserId = contextUtils.getUserId(securityContext);

        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new BadRequestException("Alquiler no encontrado"));

        if (reviewRepository.findByRentalIdAndReviewerId(rentalId, currentUserId).isPresent()) {
            throw new BadRequestException("Ya has realizado una reseña para este alquiler");
        }

        Tool tool = toolRepository.findById(rental.getToolId())
                .orElseThrow(() -> new BadRequestException("Herramienta no encontrada"));

        boolean isRenter = rental.getRenterId().equals(currentUserId);
        boolean isOwner = tool.getOwnerId().equals(currentUserId);

        if (!isRenter && !isOwner) {
            throw new BadRequestException("No tienes permiso para revisar este alquiler");
        }

        ReviewType type = isRenter ? ReviewType.RENTER_TO_OWNER : ReviewType.OWNER_TO_RENTER;
        Long revieweeId = isRenter ? tool.getOwnerId() : rental.getRenterId();

        User reviewee = userRepository.findById(revieweeId)
                .orElseThrow(() -> new BadRequestException("Usuario a revisar no encontrado"));

        String photoUrl = s3KeyResolver.toUrlOrNull(reviewee.getProfilePhotoKey());

        Review reviewData = Review.builder()
                .reviewType(type)
                .reviewee(User.builder()
                        .id(reviewee.getId())
                        .name(reviewee.getName())
                        .profilePhotoKey(photoUrl)
                        .build())
                .rental(Rental.builder()
                        .rentalId(rentalId)
                        .tool(Tool.builder().name(tool.getName()).build())
                        .renter(type == ReviewType.OWNER_TO_RENTER
                                ? User.builder().id(reviewee.getId()).name(reviewee.getName()).build()
                                : null)
                        .owner(type == ReviewType.RENTER_TO_OWNER
                                ? User.builder().id(reviewee.getId()).name(reviewee.getName()).build()
                                : null)
                        .build())
                .build();

        return Response.ok(HttpBodyResponse.builder().data(reviewData).build()).build();
    }

    @Transactional
    public Response submitReview(SecurityContext securityContext, Review review) {
        Long currentUserId = contextUtils.getUserId(securityContext);

        Rental rental = rentalRepository.findById(review.getRentalId())
                .orElseThrow(() -> new BadRequestException("Alquiler no encontrado"));

        if (reviewRepository.findByRentalIdAndReviewerId(review.getRentalId(), currentUserId).isPresent()) {
            throw new BadRequestException("Ya has realizado una reseña para este alquiler");
        }

        Tool tool = toolRepository.findById(rental.getToolId())
                .orElseThrow(() -> new BadRequestException("Herramienta no encontrada"));

        boolean isRenter = rental.getRenterId().equals(currentUserId);
        boolean isOwner = tool.getOwnerId().equals(currentUserId);

        if (!isRenter && !isOwner) {
            throw new BadRequestException("No tienes permiso para hacer una reseña para este alquiler");
        }

        ReviewType type = isRenter ? ReviewType.RENTER_TO_OWNER : ReviewType.OWNER_TO_RENTER;
        Long revieweeId = isRenter ? tool.getOwnerId() : rental.getRenterId();

        review.setReviewType(type);
        review.setRevieweeId(revieweeId);
        review.setReviewerId(currentUserId);
        reviewRepository.persist(review);

        return Response.ok(HttpBodyResponse.builder()
                .message("Reseña enviada exitosamente")
                .build()).build();
    }
}
