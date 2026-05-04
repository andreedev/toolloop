package com.toolloop.service;

import com.toolloop.model.dto.GenericInitialRentalRequest;
import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.model.entity.Rental;
import com.toolloop.model.entity.Tool;
import com.toolloop.model.entity.User;
import com.toolloop.repository.*;
import com.toolloop.util.ContextUtils;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.core.Response;
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

    @ConfigProperty(name = "aws.s3.filesBucketName")
    String filesBucketName;

    public Response previewRental(GenericInitialRentalRequest request) {
        validateGenericInitialRentalRequest(request);
        Tool tool = toolRepository.findByIdWithFirstPhoto(request.toolId())
                .orElseThrow(() -> new BadRequestException("tool does not exist"));

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

    private void validateGenericInitialRentalRequest(GenericInitialRentalRequest request) {
        if (request.toolId() == null) {
            throw new BadRequestException("toolId is required");
        }
        if (request.startDate() == null || request.endDate() == null) {
            throw new BadRequestException("startDate and endDate are required");
        }
        if (request.startDate().compareTo(request.endDate()) > 0) {
            throw new BadRequestException("startDate cannot be after endDate");
        }
        if (!toolRepository.existsById(request.toolId())) {
            throw new BadRequestException("tool does not exist");
        }
        if (!toolAvailabilityService.isToolAvailable(request.toolId(), request.startDate(), request.endDate())) {
            throw new BadRequestException("tool is not available for the selected dates");
        }
    }

    public Response createRental(GenericInitialRentalRequest request) {
        validateGenericInitialRentalRequest(request);
        return Response.ok().build();
    }
}
