package com.toolloop.service;

import com.toolloop.constants.Constants;
import com.toolloop.model.dto.*;
import com.toolloop.model.entity.*;
import com.toolloop.model.enums.ReviewType;
import com.toolloop.repository.*;
import com.toolloop.util.ContextUtils;
import com.toolloop.util.FileUtils;
import com.toolloop.util.S3KeyResolver;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.mindrot.jbcrypt.BCrypt;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.transaction.Transactional;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

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
    UserNotificationConfigRepository userNotificationConfigRepository;

    @Inject
    UserBlockRepository userBlockRepository;

    @Inject
    ContextUtils contextUtils;

    @Inject
    S3KeyResolver s3KeyResolver;

    @ConfigProperty(name = "aws.s3.filesBucketName")
    String filesBucketName;

    public Response getUserInfo(SecurityContext securityContext) {
        Long userId = contextUtils.getUserId(securityContext);

        if (userId == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new WebApplicationException("Usuario no encontrado", Response.Status.NOT_FOUND));
        user.setProfilePhotoKey(s3KeyResolver.toUrlOrNull(user.getProfilePhotoKey()));
        user.userNotificationConfig = userNotificationConfigRepository.findByUserId(userId);

        return Response.ok(HttpBodyResponse.builder()
                .data(user)
                    .build()).build();
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

    @Transactional
    public Response updateNotificationConfig(SecurityContext securityContext, UserNotificationConfig config) {
        Long userId = contextUtils.getUserId(securityContext);
        if (userId == null) return Response.status(Response.Status.UNAUTHORIZED).build();
        UserNotificationConfig existing = userNotificationConfigRepository.findByUserId(userId);
        existing.enableEmailNotifications = config.enableEmailNotifications;
        existing.notifyOnNewRentalRequest = config.notifyOnNewRentalRequest;
        existing.notifyOnRentalUpdate = config.notifyOnRentalUpdate;
        existing.notifyOnReturnReminder = config.notifyOnReturnReminder;
        existing.notifyOnNewReviewReceived = config.notifyOnNewReviewReceived;
        userNotificationConfigRepository.update(existing);
        return Response.ok(HttpBodyResponse.builder().build()).build();
    }

    public Response getPublicProfile(Long userId, SecurityContext securityContext) {
        Long viewerId = contextUtils.getUserId(securityContext);
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

        List<OwnerToolDTO> tools = toolRepository.findToolsByOwnerId(userId);
        List<OwnerToolDTO> availableTools = tools.stream().filter(tool->tool.getIsAvailable()).collect(Collectors.toList());
        availableTools.stream().forEach(tool -> {
            tool.setFirstPhotoKey(s3KeyResolver.toUrl(tool.getFirstPhotoKey()));
        });

        var profile = PublicProfileViewDTO.builder()
                .userId(user.getId())
                .name(user.getName())
                .memberSince(user.getCreatedAt())
                .postalCode(user.getPostalCode())
                .availabilityDescription(user.getAvailabilityDescription())
                .profilePhotoKey(s3KeyResolver.toUrlOrNull(user.getProfilePhotoKey()))
                .averageRatingAsOwner(reviewRepository.findAverageRatingForUserAsOwner(userId))
                .averageRatingAsRenter(reviewRepository.findAverageRatingForUserAsRenter(userId))
                .totalReviewsAsOwner(totalReviewsAsOwner)
                .totalReviewsAsRenter(totalReviewsAsRenter)
                .availableTools(availableTools)
                .reviews(reviews)
                .isBlockedByCurrentUser(userBlockRepository.existsByBlockerIdAndBlockedId(viewerId, userId))
                .build();
        return Response.ok(HttpBodyResponse.builder()
                .data(profile)
                .build()).build();
    }

    @Transactional
    public Response updatePassword(SecurityContext securityContext, UpdatePasswordRequest request) {
        Long userId = contextUtils.getUserId(securityContext);
        if (request == null
                || request.currentPassword() == null || request.currentPassword().isBlank()
                || request.newPassword() == null || request.newPassword().isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(HttpBodyResponse.builder().message("Las contraseñas son obligatorias").build()).build();
        }
        if (request.newPassword().length() < 8) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(HttpBodyResponse.builder().message("La nueva contraseña debe tener al menos 8 caracteres").build()).build();
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new WebApplicationException("Usuario no encontrado", Response.Status.NOT_FOUND));
        if (!BCrypt.checkpw(request.currentPassword(), user.getPassword())) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(HttpBodyResponse.builder().message("Contraseña actual incorrecta").build()).build();
        }
        if (BCrypt.checkpw(request.newPassword(), user.getPassword())) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(HttpBodyResponse.builder().message("La nueva contraseña debe ser distinta de la actual").build()).build();
        }
        user.setPassword(BCrypt.hashpw(request.newPassword(), BCrypt.gensalt()));
        userRepository.update(user);
        return Response.ok(HttpBodyResponse.builder().message("Contraseña actualizada correctamente").build()).build();
    }

    @Transactional
    public Response updateAvailabilityDescription(SecurityContext securityContext, UpdateUserAvailabilityDescriptionRequest request) {
        Long userId = contextUtils.getUserId(securityContext);
        User user = userRepository.findById(userId).orElseThrow(() -> new WebApplicationException("Usuario no encontrado", Response.Status.NOT_FOUND));
        user.setAvailabilityDescription(request.availabilityDescription());
        userRepository.update(user);
        return Response.ok(HttpBodyResponse.builder().build()).build();
    }

    @Transactional
    public Response unblockUser(SecurityContext securityContext, Long blockedId) {
        Long blockerId = contextUtils.getUserId(securityContext);
        userBlockRepository.deleteByBlockerIdAndBlockedId(blockerId, blockedId);
        return Response.ok(HttpBodyResponse.builder().build()).build();
    }

    @Transactional
    public Response updateProfilePhoto(SecurityContext securityContext, UpdateProfilePhotoRequest request) {
        Long userId = contextUtils.getUserId(securityContext);
        if (request == null || request.filename() == null || request.filename().isBlank()) {
            throw new IllegalArgumentException("El nombre del archivo es obligatorio");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new WebApplicationException("Usuario no encontrado", Response.Status.NOT_FOUND));

        String newKey = Constants.USER_AVATARS_DIR + "/" + UUID.randomUUID() + "." + FileUtils.getExtension(request.filename());
        String contentType = FileUtils.getContentTypeFromExtension(newKey);
        String presignedUrl = S3Service.createUploadPresignedUrl(newKey, filesBucketName, true, contentType);

        String oldKey = user.getProfilePhotoKey();
        user.setProfilePhotoKey(newKey);
        userRepository.update(user);

        if (oldKey != null && !oldKey.isBlank()) {
            try {
                S3Service.deleteObjectByKey(oldKey, filesBucketName);
            } catch (Exception e) {
                log.warn("No se pudo eliminar la foto de perfil anterior: {}", oldKey, e);
            }
        }

        Map<String, String> data = new HashMap<>();
        data.put("profilePhotoPresignedUrl", presignedUrl);
        data.put("profilePhotoUrl", s3KeyResolver.toUrl(newKey));

        return Response.ok(HttpBodyResponse.builder().data(data).build()).build();
    }

    @Transactional
    public Response blockUser(SecurityContext securityContext, Long blockedId) {
        Long blockerId = contextUtils.getUserId(securityContext);
        UserBlock userBlock = UserBlock.builder()
                .blockerId(blockerId)
                .blockedId(blockedId)
                .build();
        userBlockRepository.persist(userBlock);
        return Response.ok(HttpBodyResponse.builder().build()).build();
    }
}
