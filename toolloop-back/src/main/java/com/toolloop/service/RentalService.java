package com.toolloop.service;

import com.toolloop.model.dto.GenericInitialRentalRequest;
import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.model.entity.Rental;
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
import java.time.temporal.ChronoUnit;

@Slf4j
@ApplicationScoped
public class RentalService {

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

    public Response previewRental(SecurityContext securityContext, GenericInitialRentalRequest request) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        User user = userRepository.findById(currentUserId).get();
        Tool tool = toolRepository.findByIdWithFirstPhoto(request.toolId())
                .orElseThrow(() -> new BadRequestException("tool does not exist"));
        validateGenericInitialRentalRequest(user, tool, request);

        Long totalDays = ChronoUnit.DAYS.between(request.startDate(), request.endDate());
        BigDecimal subtotal = tool.pricePerDay.multiply(BigDecimal.valueOf(totalDays));
        BigDecimal totalPrice = tool.pricePerDay.multiply(BigDecimal.valueOf(totalDays)).add(tool.securityDeposit);

        HttpBodyResponse response = new HttpBodyResponse();
        Rental rental = new Rental();
        rental.startDate = request.startDate();
        rental.endDate = request.endDate();
        rental.owner = userRepository.findById(tool.getOwnerId()).orElse(null);
        rental.tool = tool;
        rental.dailyRate = tool.pricePerDay;
        rental.totalDays = totalDays.intValue();
        rental.subtotalAmount = subtotal;
        rental.totalAmount = totalPrice;
        rental.depositAmount = tool.securityDeposit;

        response.data = rental;
        return Response.ok(response).build();
    }

    public Response createRental(SecurityContext securityContext, GenericInitialRentalRequest request) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        User user = userRepository.findById(currentUserId).get();
        Tool tool = toolRepository.findById(request.toolId())
                .orElseThrow(() -> new BadRequestException("tool does not exist"));
        validateGenericInitialRentalRequest(user, tool, request);
        return Response.ok().build();
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
}
