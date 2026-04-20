package com.toolloop.service;

import com.toolloop.model.dto.DashboardInfo;
import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.model.entity.Rental;
import com.toolloop.model.entity.Tool;
import com.toolloop.model.entity.User;
import com.toolloop.repository.RentalRepository;
import com.toolloop.repository.ReviewRepository;
import com.toolloop.repository.ToolRepository;
import com.toolloop.repository.UserRepository;
import com.toolloop.util.ContextUtils;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
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

    public Response getUserInfo(SecurityContext securityContext) {
        Long userId = contextUtils.getUserId(securityContext);

        if (userId == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
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
        BigDecimal userRating = reviewRepository.findAverageRatingByUserId(userId);
        Rental nextExpiringRental = rentalRepository.findNextExpiringRentalByRenterId(userId).orElse(null);
        List<Tool> recentTools = toolRepository.findRecentToolsByOwnerId(userId, 2);

        DashboardInfo dashboardInfo = DashboardInfo.builder()
                .totalEarnings(totalEarnings)
                .totalRentals(totalRentals)
                .totalTools(totalTools)
                .activeRentals(activeRentals)
                .userRating(userRating)
                .nextExpiringRental(nextExpiringRental)
                .recentTools(recentTools)
                .build();

        return Response.ok(HttpBodyResponse.builder()
                .data(dashboardInfo)
                .build()).build();
    }
}
