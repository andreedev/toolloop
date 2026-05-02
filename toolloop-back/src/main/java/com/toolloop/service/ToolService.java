package com.toolloop.service;

import com.toolloop.constants.Constants;
import com.toolloop.model.dto.*;
import com.toolloop.model.entity.*;
import com.toolloop.repository.*;
import com.toolloop.util.ContextUtils;
import com.toolloop.util.FileUtils;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.transaction.Transactional;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@ApplicationScoped
public class ToolService {

    @Inject
    UserRepository userRepository;

    @Inject
    ToolRepository toolRepository;

    @Inject
    ToolPhotoRepository toolPhotoRepository;

    @Inject
    ToolAvailabilityRuleRepository toolAvailabilityRuleRepository;

    @Inject
    ToolAvailabilityExceptionRepository toolAvailabilityExceptionRepository;

    @Inject
    ReviewRepository reviewRepository;

    @Inject
    RentalRepository rentalRepository;

    @Inject
    FavoriteRepository favoriteRepository;

    @Inject
    CategoryRepository categoryRepository;

    @Inject
    PostalCodeGeoRepository postalCodeGeoRepository;

    @Inject
    ContextUtils contextUtils;

    @ConfigProperty(name = "aws.s3.filesBucketName")
    String filesBucketName;

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

    @Transactional
    public Response addTool(SecurityContext securityContext, AddToolRequest request) {
        User currentUser = userRepository.findById(contextUtils.getUserId(securityContext)).orElse(null);
        validateAddToolRequest(currentUser, request);

        Tool tool = new Tool();
        tool.ownerId = currentUser.getId();
        tool.categoryId = request.categoryId();
        tool.name = request.name();
        tool.description = request.description();
        tool.pricePerDay = request.pricePerDay();
        tool.securityDeposit = request.securityDeposit();
        tool.condition = Tool.ToolCondition.valueOf(request.condition());
        toolRepository.persist(tool);
        Long toolId = tool.getToolId();

        // availabity handling
        ToolAvailabilityDTO availability = request.availability();
        if (availability.ruleType() != null){
            ToolAvailabilityRule.RuleType ruleType = ToolAvailabilityRule.RuleType.valueOf(availability.ruleType());
            ToolAvailabilityRule availabilityRule = new ToolAvailabilityRule();
            availabilityRule.toolId = toolId;
            availabilityRule.ruleType = ruleType;
            toolAvailabilityRuleRepository.persist(availabilityRule);
        }  else {
            // custom availability with exceptions
            List<AvailabilityExceptionDTO> exceptions = availability.exceptions();
            for (AvailabilityExceptionDTO exception : exceptions) {
                ToolAvailabilityException availabilityException = new ToolAvailabilityException();
                availabilityException.toolId = toolId;
                availabilityException.date = exception.date();
                availabilityException.isAvailable = exception.isAvailable();
                toolAvailabilityExceptionRepository.persist(availabilityException);
            }
        }

        List<String> preSignedUrls = new ArrayList<>();
        for (int i = 0; i < request.photoKeys().size(); i++) {
            String originalKey = request.photoKeys().get(i);

            String photoKey = Constants.TOOL_PHOTOS_DIR  + "/" + i + "_" + originalKey;
            String contentType = FileUtils.getContentTypeFromExtension(originalKey);

            ToolPhoto photo = new ToolPhoto();
            photo.toolId = toolId;
            photo.photoKey = photoKey;

            toolPhotoRepository.persist(photo);

            String preSignedUrl = S3Service.createUploadPresignedUrl(
                    photoKey, filesBucketName, true, contentType
            );
            preSignedUrls.add(preSignedUrl);
        }
        AddToolResponse responseData = AddToolResponse.builder()
                .toolId(toolId)
                .preSignedUrls(preSignedUrls)
                .build();
        return Response.ok(HttpBodyResponse.builder()
                .data(responseData)
                .message("Tool created successfully")
                .build()
            ).build();
    }

    public Response getToolsForMap(SecurityContext securityContext, MapToolsRequest request) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        User currentUser = userRepository.findById(currentUserId).orElse(null);

        String namePattern = (request.name() != null && !request.name().isBlank())
                ? "%" + request.name() + "%" : null;

        List<Tool> tools = toolRepository.findToolsForMap(
                namePattern, request.categoryId(), request.maxPricePerDay(), currentUserId);

        PostalCodeGeo userGeo = (currentUser != null && currentUser.postalCode != null)
                ? postalCodeGeoRepository.findByPostalCode(currentUser.postalCode).orElse(null)
                : null;

        List<ToolMapItem> items = tools.stream().map(tool -> {
            User owner = userRepository.findById(tool.getOwnerId()).orElse(null);
            if (owner == null) return null;

            PostalCodeGeo toolGeo = (owner.postalCode != null)
                    ? postalCodeGeoRepository.findByPostalCode(owner.postalCode).orElse(null)
                    : null;
            if (toolGeo == null) return null;

            BigDecimal avgRating = reviewRepository.findAverageRatingByUserId(owner.getId());
            Integer distance = (userGeo != null)
                    ? calculateDistanceMeters(
                            userGeo.latitude.doubleValue(), userGeo.longitude.doubleValue(),
                            toolGeo.latitude.doubleValue(), toolGeo.longitude.doubleValue())
                    : null;

            User ownerDto = User.builder()
                    .id(owner.getId())
                    .name(owner.getName())
                    .averageRating(avgRating)
                    .build();

            return ToolMapItem.builder()
                    .toolId(tool.getToolId())
                    .name(tool.getName())
                    .pricePerDay(tool.getPricePerDay())
                    .isReserved(tool.getIsReserved())
                    .photos(tool.getPhotos())
                    .category(tool.getCategory())
                    .owner(ownerDto)
                    .latitude(toolGeo.latitude)
                    .longitude(toolGeo.longitude)
                    .distanceMeters(distance)
                    .build();
        }).filter(java.util.Objects::nonNull).collect(java.util.stream.Collectors.toList());

        return Response.ok(HttpBodyResponse.builder().data(items).build()).build();
    }

    private int calculateDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (int) (R * c);
    }

    private void validateAddToolRequest(User user, AddToolRequest request) {
        if (request.name() == null || request.name().isEmpty()) {
            throw new BadRequestException("El nombre de la herramienta es obligatorio.");
        }
        if (request.pricePerDay() == null || request.pricePerDay().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("El precio por día debe ser un valor positivo.");
        }
        try {
            Tool.ToolCondition.valueOf(request.condition());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("La condición de la herramienta es inválida.");
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
        if (request.availability() == null) {
            throw new BadRequestException("La información de disponibilidad es obligatoria.");
        }
         if (request.availability().ruleType() == null && (request.availability().exceptions() == null || request.availability().exceptions().isEmpty())) {
            throw new BadRequestException("Si no se especifica un tipo de regla de disponibilidad, se deben proporcionar excepciones de disponibilidad.");
        }
        if (request.availability().ruleType() != null && request.availability().exceptions() != null && !request.availability().exceptions().isEmpty()) {
            throw new BadRequestException("No se pueden proporcionar excepciones de disponibilidad si se especifica un tipo de regla de disponibilidad.");
        }

    }
}
