package com.toolloop.service;

import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.model.entity.Tool;
import com.toolloop.model.entity.User;
import com.toolloop.repository.*;
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
public class ToolService {

    @Inject
    UserRepository userRepository;

    @Inject
    ToolRepository toolRepository;

    @Inject
    ReviewRepository reviewRepository;

    @Inject
    RentalRepository rentalRepository;

    @Inject
    FavoriteRepository favoriteRepository;

    @Inject
    ContextUtils contextUtils;

    public Response getToolDetails(SecurityContext securityContext, String toolId) {
        Optional<Tool> toolOpt = toolRepository.findById(Long.valueOf(toolId));
        if (toolOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        Tool tool = toolOpt.get();
        User currentUser = userRepository.findById(contextUtils.getUserId(securityContext)).orElse(null);
        tool.setIsReserved(toolRepository.isToolReserved(tool.getToolId()));
        tool.setPhotos(toolRepository.findPhotosByToolId(tool.getToolId()));
        User owner = userRepository.findById(tool.getOwnerId()).orElse(null);
        BigDecimal userRating = reviewRepository.findAverageRatingByUserId(owner.getId());
        Integer totalRentals = rentalRepository.countByRenterId(owner.getId());
        boolean isFavorited = favoriteRepository.isToolFavoritedByUser(currentUser.getId(), tool.getToolId());
        tool.setOwner(User.builder()
                .id(owner.getId())
                .name(owner.getName())
                .averageRating(userRating)
                .totalRentals(totalRentals)
                .build());
        tool.setReviewCount(toolRepository.countReviewsByToolId(tool.getToolId()));
        tool.setIsFavorited(isFavorited);
        return Response.ok(HttpBodyResponse.builder()
                .data(tool)
                .build()).build();
    }

    public Response getUserTools(SecurityContext securityContext) {
        Long userId = contextUtils.getUserId(securityContext);
        List<Tool> tools = toolRepository.findRecentToolsByOwnerId(userId, 10);
        return Response.ok(HttpBodyResponse.builder()
                .data(tools)
                .build()).build();
    }

}
