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

    public Response getReviewContext(Long rentalId, SecurityContext securityContext) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        Optional<Rental> rental = rentalRepository.findById(rentalId);
        if (rental.isEmpty()) {
            throw new BadRequestException("Alquiler no encontrado");
        }
        if (!rental.get().getRenterId().equals(currentUserId) && !rental.get().tool.getOwnerId().equals(currentUserId)) {
            throw new BadRequestException("No tienes permiso para revisar este alquiler");
        }
        if (reviewRepository.findByRentalIdAndReviewerId(rentalId, currentUserId).isPresent()) {
            throw new BadRequestException("Ya tienes una reseña para este alquiler");
        }
        ReviewType reviewType = rental.get().getRenterId().equals(currentUserId) ? ReviewType.RENTER_TO_OWNER : ReviewType.OWNER_TO_RENTER;
        Review reviewData = Review.builder()
                .reviewType(reviewType)
                .build();
        return Response.ok().build();
    }
}
