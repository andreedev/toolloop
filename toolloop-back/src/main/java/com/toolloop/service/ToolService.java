package com.toolloop.service;

import com.toolloop.constants.Constants;
import com.toolloop.model.dto.*;
import com.toolloop.model.entity.*;
import com.toolloop.model.enums.ToolAvailabilityRuleType;
import com.toolloop.repository.*;
import com.toolloop.util.ContextUtils;
import com.toolloop.util.FileUtils;
import com.toolloop.util.S3KeyResolver;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.transaction.Transactional;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

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

    @Inject
    S3KeyResolver s3KeyResolver;

    @ConfigProperty(name = "aws.s3.filesBucketName")
    String filesBucketName;


    @Inject
    ToolFavoriteRepository toolFavoriteRepository;

    public Response getToolDetails(SecurityContext securityContext, String toolId) {
        Tool tool = toolRepository.findById(Long.valueOf(toolId))
                .orElseThrow(() -> new WebApplicationException("Tool not found", Response.Status.NOT_FOUND));

        User currentUser = userRepository.findById(contextUtils.getUserId(securityContext))
                .orElseThrow(() -> new WebApplicationException("User not found", Response.Status.UNAUTHORIZED));

        tool.setCategory(categoryRepository.findById(tool.getCategoryId()).orElse(null));
        tool.setIsAvailable(toolRepository.isToolAvailable(tool.getToolId()));
        tool.setPhotos(toolRepository.findPhotosByToolId(tool.getToolId()));
        User owner = userRepository.findById(tool.getOwnerId()).orElse(null);
        BigDecimal userRating = reviewRepository.findAverageUserGeneralRating(owner.getId());
        BigDecimal toolRating = reviewRepository.findAverageToolRating(tool.getToolId());
        Integer totalRentals = rentalRepository.countByRenterId(owner.getId());
        boolean isFavorited = favoriteRepository.isToolFavoritedByUser(currentUser.getId(), tool.getToolId());
        tool.setOwner(User.builder()
                .id(owner.getId())
                .name(owner.getName())
                .averageRating(userRating)
                .totalRentals(totalRentals)
                .profilePhotoKey(s3KeyResolver.toUrlOrNull(owner.getProfilePhotoKey()))
                .build());
        tool.setReviewCount(toolRepository.countReviewsByToolId(tool.getToolId()));
        tool.setIsFavorited(isFavorited);
        tool.setAverageRating(toolRating);
        PostalCodeGeo userGeo = getUserPostalCodeGeo(currentUser);
        PostalCodeGeo toolGeo = postalCodeGeoRepository.findByPostalCode(owner.postalCode).orElse(null);
        Integer distance = calculateDistanceMeters(
                userGeo.latitude.doubleValue(), userGeo.longitude.doubleValue(),
                toolGeo.latitude.doubleValue(), toolGeo.longitude.doubleValue());
        tool.setDistanceMeters(distance);
        return Response.ok(HttpBodyResponse.builder()
                .data(tool)
                .build()).build();
    }

    public Response getUserTools(SecurityContext securityContext) {
        Long userId = contextUtils.getUserId(securityContext);
        List<Tool> tools = toolRepository.findRecentToolsByOwnerId(userId);
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
            ToolAvailabilityRuleType ruleType = ToolAvailabilityRuleType.valueOf(availability.ruleType());
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

        PostalCodeGeo userGeo = getUserPostalCodeGeo(currentUser);

        List<ToolMapItem> items = tools.stream().map(tool -> {
            User owner = userRepository.findById(tool.getOwnerId()).orElse(null);
            if (owner == null) return null;

            PostalCodeGeo toolGeo = postalCodeGeoRepository.findByPostalCode(owner.postalCode).orElse(null);
            if (toolGeo == null) return null;

            BigDecimal avgRating = reviewRepository.findAverageToolRating(tool.getToolId());
            Integer distance = calculateDistanceMeters(
                            userGeo.latitude.doubleValue(), userGeo.longitude.doubleValue(),
                            toolGeo.latitude.doubleValue(), toolGeo.longitude.doubleValue());

            boolean isFavorited = favoriteRepository.isToolFavoritedByUser(currentUser.getId(), tool.getToolId());

            User ownerDto = User.builder()
                    .id(owner.getId())
                    .name(owner.getName())
                    .averageRating(avgRating)
                    .profilePhotoKey(s3KeyResolver.toUrlOrNull(owner.getProfilePhotoKey()))
                    .build();

            return ToolMapItem.builder()
                    .toolId(tool.getToolId())
                    .name(tool.getName())
                    .pricePerDay(tool.getPricePerDay())
                    .isAvailable(tool.getIsAvailable())
                    .photos(tool.getPhotos())
                    .category(tool.getCategory())
                    .owner(ownerDto)
                    .latitude(toolGeo.latitude)
                    .longitude(toolGeo.longitude)
                    .distanceMeters(distance)
                    .isFavorited(isFavorited)
                    .build();
        }).filter(Objects::nonNull).collect(Collectors.toList());

        return Response.ok(HttpBodyResponse.builder().data(items).build()).build();
    }

    private PostalCodeGeo getUserPostalCodeGeo(User user) {
        if (user.postalCode == null) return null;
        return postalCodeGeoRepository.findByPostalCode(user.postalCode).orElse(null);
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

    @Transactional
    public Response updateTool(SecurityContext securityContext, Long toolId, UpdateToolRequest request) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        Optional<Tool> toolOpt = toolRepository.findById(toolId);
        if (toolOpt.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        Tool tool = toolOpt.get();
        if (!tool.ownerId.equals(currentUserId)) return Response.status(Response.Status.FORBIDDEN).build();

        if (request.name() == null || request.name().isBlank())
            throw new BadRequestException("El nombre es obligatorio.");
        if (request.pricePerDay() == null || request.pricePerDay().compareTo(BigDecimal.ZERO) <= 0)
            throw new BadRequestException("El precio debe ser positivo.");
        try { Tool.ToolCondition.valueOf(request.condition()); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Condición inválida."); }

        tool.name = request.name();
        tool.description = request.description();
        tool.pricePerDay = request.pricePerDay();
        tool.securityDeposit = request.securityDeposit();
        tool.categoryId = request.categoryId();
        tool.condition = Tool.ToolCondition.valueOf(request.condition());

        toolAvailabilityRuleRepository.deleteByToolId(toolId);
        toolAvailabilityExceptionRepository.deleteByToolId(toolId);

        ToolAvailabilityDTO availability = request.availability();
        if (availability.ruleType() != null) {
            ToolAvailabilityRule availabilityRule = new ToolAvailabilityRule();
            availabilityRule.toolId = toolId;
            availabilityRule.ruleType = ToolAvailabilityRuleType.valueOf(availability.ruleType());
            toolAvailabilityRuleRepository.persist(availabilityRule);
        } else {
            for (AvailabilityExceptionDTO exc : availability.exceptions()) {
                ToolAvailabilityException e = new ToolAvailabilityException();
                e.toolId = toolId;
                e.date = exc.date();
                toolAvailabilityExceptionRepository.persist(e);
            }
        }

        return Response.ok(HttpBodyResponse.builder().message("Tool updated successfully").build()).build();
    }

    public Response getToolReviews(Long toolId) {
        List<Review> reviews = reviewRepository.findByToolId(toolId);
        for (Review review : reviews) {
            User reviewer  = userRepository.findById(review.getReviewerId()).orElse(null);
            if (reviewer != null) {
                review.reviewer = User.builder()
                        .id(reviewer.getId())
                        .name(reviewer.getName())
                        .averageRating(reviewRepository.findAverageUserGeneralRating(reviewer.getId()))
                        .profilePhotoKey(s3KeyResolver.toUrlOrNull(reviewer.getProfilePhotoKey()))
                        .build();
            }
        }
        return Response.ok(HttpBodyResponse.builder().data(reviews).build()).build();
    }

    public Response getFeaturedTools() {
        List<Tool> tools = toolRepository.findFeatured(5);
        List<FeaturedToolDTO> items = tools.stream().map(tool -> FeaturedToolDTO.builder()
                .toolId(tool.getToolId())
                .name(tool.getName())
                .photoUrl(tool.getPhotos() != null && !tool.getPhotos().isEmpty()
                        ? tool.getPhotos().get(0).getPhotoKey() : null)
                .pricePerDay(tool.getPricePerDay())
                .isAvailable(!Boolean.TRUE.equals(tool.getIsAvailable()))
                .build()).collect(Collectors.toList());
        return Response.ok(HttpBodyResponse.builder().data(items).build()).build();
    }

    @Transactional
    public Response deleteTool(SecurityContext securityContext, Long toolId) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        Optional<Tool> toolOpt = toolRepository.findById(toolId);
        if (toolOpt.isEmpty()) return Response.status(Response.Status.NOT_FOUND).build();
        Tool tool = toolOpt.get();
        if (!tool.ownerId.equals(currentUserId)) return Response.status(Response.Status.FORBIDDEN).build();
        boolean existsRental = rentalRepository.existsAnyByToolId(toolId);
        if (existsRental) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(HttpBodyResponse.builder().message("No se puede eliminar la herramienta porque tiene alquileres asociados. Puedes cambiar su disponibilidad si ya no quieres alquilarla")
                    .build()).build();
        }
        toolAvailabilityRuleRepository.deleteByToolId(toolId);
        toolAvailabilityExceptionRepository.deleteByToolId(toolId);
        toolFavoriteRepository.deleteByToolId(toolId);
        List<ToolPhoto> photos = toolPhotoRepository.findByToolId(toolId);
        photos.stream().forEach(value -> {
            log.info("Deleting photo with key: {}", value.getPhotoKey());
            S3Service.deleteObjectByKey(value.getPhotoKey(), filesBucketName);
            toolPhotoRepository.delete(value);
        });
        toolRepository.delete(tool);
        return Response.ok(HttpBodyResponse.builder().message("Herramienta eliminada exitosamente").build()).build();
    }
}
