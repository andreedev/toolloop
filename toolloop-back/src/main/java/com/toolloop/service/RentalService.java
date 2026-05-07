package com.toolloop.service;

import com.toolloop.model.dto.FindRentalsByOwnerResponse;
import com.toolloop.model.dto.GenericInitialRentalRequest;
import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.model.entity.Rental;
import com.toolloop.model.entity.Tool;
import com.toolloop.model.entity.User;
import com.toolloop.model.enums.RentalStatus;
import com.toolloop.repository.*;
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

@Slf4j
@ApplicationScoped
public class RentalService {

    @Inject
    UserRepository userRepository;

    @Inject
    ToolRepository toolRepository;

    @Inject
    NotificationService notificationService;

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
    FavoriteRepository favoriteRepository;

    @Inject
    CategoryRepository categoryRepository;

    @Inject
    PostalCodeGeoRepository postalCodeGeoRepository;

    @Inject
    ContextUtils contextUtils;

    @Inject
    S3KeyResolver s3KeyResolver;

    public Response previewRental(SecurityContext securityContext, GenericInitialRentalRequest request) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        User user = userRepository.findById(currentUserId).get();
        Tool tool = toolRepository.findByIdWithFirstPhoto(request.toolId())
                .orElseThrow(() -> new BadRequestException("tool does not exist"));
        validateGenericInitialRentalRequest(user, tool, request);

        Long totalDays = ChronoUnit.DAYS.between(request.startDate(), request.endDate());
        BigDecimal subtotal = tool.pricePerDay.multiply(BigDecimal.valueOf(totalDays));
        BigDecimal totalPrice = tool.pricePerDay.multiply(BigDecimal.valueOf(totalDays)).add(tool.securityDeposit);

        Rental rental = new Rental();
        rental.startDate = request.startDate();
        rental.endDate = request.endDate();
        User owner = userRepository.findById(tool.getOwnerId()).orElse(null);
        if (owner != null) {
            rental.owner = User.builder()
                    .id(owner.getId())
                    .name(owner.getName())
                    .email(owner.getEmail())
                    .postalCode(owner.getPostalCode())
                    .profilePhotoKey(s3KeyResolver.toUrlOrNull(owner.getProfilePhotoKey()))
                    .build();
        }
        rental.tool = tool;
        rental.dailyRate = tool.pricePerDay;
        rental.totalDays = totalDays.intValue();
        rental.subtotalAmount = subtotal;
        rental.totalAmount = totalPrice;
        rental.depositAmount = tool.securityDeposit;

        HttpBodyResponse response = new HttpBodyResponse();
        response.data = rental;
        return Response.ok(response).build();
    }

    @Transactional
    public Response createRental(SecurityContext securityContext, GenericInitialRentalRequest request) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        User user = userRepository.findById(currentUserId).get();
        Tool tool = toolRepository.findById(request.toolId())
                .orElseThrow(() -> new BadRequestException("tool does not exist"));
        validateGenericInitialRentalRequest(user, tool, request);

        Long totalDays = ChronoUnit.DAYS.between(request.startDate(), request.endDate());
        BigDecimal subtotal = tool.pricePerDay.multiply(BigDecimal.valueOf(totalDays));
        BigDecimal totalPrice = tool.pricePerDay.multiply(BigDecimal.valueOf(totalDays)).add(tool.securityDeposit);

        Rental rental = new Rental();
        rental.toolId = request.toolId();
        rental.renterId = currentUserId;
        rental.startDate = request.startDate();
        rental.endDate = request.endDate();
        rental.dailyRate = tool.pricePerDay;
        rental.totalDays = totalDays.intValue();
        rental.subtotalAmount = subtotal;
        rental.totalAmount = totalPrice;
        rental.depositAmount = tool.securityDeposit;
        rental.status = RentalStatus.Pendiente;
        rentalRepository.persist(rental);
        notificationService.notifyRentalRequested(user, tool, rental);

        return Response.ok(HttpBodyResponse.builder()
                .message("Alquiler de herramienta solicitado con éxito")
                .data(rental.rentalId)
                .build()).build();
    }

    private void validateGenericInitialRentalRequest(User user, Tool tool, GenericInitialRentalRequest request) {
        if (request.toolId() == null) {
            throw new BadRequestException("El ID de la herramienta es requerido");
        }
        if (request.startDate() == null || request.endDate() == null) {
            throw new BadRequestException("La fecha de inicio y la fecha de fin son requeridas");
        }
        if (request.startDate().compareTo(request.endDate()) > 0) {
            throw new BadRequestException("La fecha de inicio debe ser anterior a la fecha de fin");
        }
        if (!toolRepository.existsById(request.toolId())) {
            throw new BadRequestException("La herramienta no existe");
        }
        if (!toolAvailabilityService.isToolAvailable(request.toolId(), request.startDate(), request.endDate())) {
            throw new BadRequestException("La herramienta no está disponible en las fechas seleccionadas");
        }
        if (tool.getOwnerId().equals(user.getId())) {
            throw new BadRequestException("No puedes alquilar tu propia herramienta");
        }
    }

    public Response getRentalDetails(SecurityContext securityContext, Long rentalId) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        Rental rental = rentalRepository.findById(rentalId).orElseThrow(() -> new BadRequestException("El alquiler no existe"));

        Tool tool = toolRepository.findByIdWithFirstPhoto(rental.toolId).orElse(null);
        User owner = userRepository.findById(tool.getOwnerId()).orElse(null);
        rental.owner = owner;
        rental.tool = tool;
        if (!rental.renterId.equals(currentUserId)) {
            throw new BadRequestException("No tienes permiso para ver los detalles de este alquiler");
        }
        return Response.ok(HttpBodyResponse.builder()
                .data(rental)
                .build()).build();
    }

    public Response findByOwner(SecurityContext securityContext) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        List<Rental> rentals = rentalRepository.findByOwnerId(currentUserId);
        int totalInUseRentals = rentals.stream()
                .filter(rental -> rental.status == RentalStatus.En_Uso)
                .toArray().length;
        int totalPendingRentals = rentals.stream()
                .filter(rental -> rental.status == RentalStatus.Pendiente)
                .toArray().length;
        var response = FindRentalsByOwnerResponse.builder()
                .totalInUseRentals(totalInUseRentals)
                .totalPendingRentals(totalPendingRentals)
                .rentals(rentals)
                .build();
        return Response.ok(HttpBodyResponse.builder()
                .data(response)
                .build()).build();

    }

    public Response findByRenter(SecurityContext securityContext) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        List<Rental> rentals = rentalRepository.findByRenterId(currentUserId);
        return Response.ok(HttpBodyResponse.builder()
                .data(rentals)
                .build()).build();
    }
}
