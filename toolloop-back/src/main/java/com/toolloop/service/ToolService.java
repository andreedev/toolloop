package com.toolloop.service;

import com.toolloop.model.dto.AddToolRequest;
import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.model.entity.Category;
import com.toolloop.model.entity.Tool;
import com.toolloop.model.entity.User;
import com.toolloop.repository.*;
import com.toolloop.util.ContextUtils;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.BadRequestException;
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
    CategoryRepository categoryRepository;

    @Inject
    ContextUtils contextUtils;

    public Response getToolDetails(SecurityContext securityContext, String toolId) {
        Optional<Tool> toolOpt = toolRepository.findById(Long.valueOf(toolId));
        if (toolOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        Tool tool = toolOpt.get();
        User currentUser = userRepository.findById(contextUtils.getUserId(securityContext)).orElse(null);
        tool.setCategory(categoryRepository.findById(tool.getCategoryId()).orElse(null));
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

    public Response addTool(SecurityContext securityContext, AddToolRequest request) {
        User currentUser = userRepository.findById(contextUtils.getUserId(securityContext)).orElse(null);
        validateAddToolRequest(currentUser, request);
        return Response.ok().build();
    }

    private void validateAddToolRequest(User user, AddToolRequest request) {
        if (request.name() == null || request.name().isEmpty()) {
            throw new BadRequestException("El nombre de la herramienta es obligatorio.");
        }
        if (request.pricePerDay() == null || request.pricePerDay().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("El precio por día debe ser un valor positivo.");
        }
        if (request.condition() == null) {
            throw new BadRequestException("La condición de la herramienta es obligatoria.");
        }
        if (request.categoryId() == null) {
            throw new BadRequestException("La categoría de la herramienta es obligatoria.");
        }
        if (categoryRepository.findById(request.categoryId()).isEmpty()) {
            throw new BadRequestException("La categoría especificada no existe.");
        }
        if (request.securityDeposit() != null && request.securityDeposit().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("El depósito de seguridad no puede ser negativo.");
        }
        if (request.description() != null && request.description().length() > 1000) {
            throw new BadRequestException("La descripción no puede exceder los 1000 caracteres.");
        }
        if (request.photoKeys() != null && request.photoKeys().size() > 5) {
            throw new BadRequestException("No se pueden subir más de 5 fotos.");
        }
        for (String key : request.photoKeys()) {
            if (key == null || key.isEmpty()) {
                throw new BadRequestException("Las claves de las fotos no pueden ser nulas o vacías.");
            }
        }
        if (toolRepository.existsByOwnerIdAndName(user.getId(), request.name())) {
            throw new BadRequestException("Ya tienes una herramienta con ese nombre");
        }
    }
}
