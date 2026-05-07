package com.toolloop.service;

import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.model.dto.ToolCalendarDayDTO;
import com.toolloop.model.dto.ToolCalendarResponseDTO;
import com.toolloop.model.entity.Rental;
import com.toolloop.model.entity.ToolAvailabilityException;
import com.toolloop.model.entity.ToolAvailabilityRule;
import com.toolloop.model.enums.DayStatus;
import com.toolloop.model.enums.RentalStatus;
import com.toolloop.repository.RentalRepository;
import com.toolloop.repository.ToolAvailabilityExceptionRepository;
import com.toolloop.repository.ToolAvailabilityRuleRepository;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.core.Response;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@ApplicationScoped
public class ToolAvailabilityService {

    @Inject ToolAvailabilityRuleRepository ruleRepo;

    @Inject ToolAvailabilityExceptionRepository exceptionRepo;

    @Inject RentalRepository rentalRepo;

    public Response getToolAvailability(Long toolId, String period) {
        YearMonth month = YearMonth.parse(period);

        LocalDate start = month.atDay(1);
        LocalDate end   = month.atEndOfMonth();

        ToolAvailabilityRule rule        = ruleRepo.findByToolId(toolId);
        List<ToolAvailabilityException> exceptions = exceptionRepo.findByToolIdAndMonth(toolId, start, end);
        List<Rental> activeRentals       = rentalRepo.findActiveByToolIdAndRange(toolId, start, end);

        Set<LocalDate> blockedDates = exceptions.stream()
                .map(e -> e.date)
                .collect(Collectors.toSet());

        Set<LocalDate> rentedDays = new HashSet<>();
        for (Rental r : activeRentals) {
            if (r.status == RentalStatus.Aprobada || r.status == RentalStatus.En_Uso) {
                r.startDate.datesUntil(r.endDate.plusDays(1))
                        .forEach(rentedDays::add);
            }
        }

        List<ToolCalendarDayDTO> days = new ArrayList<>();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {

            DayStatus status;

            if (rentedDays.contains(date)) {
                status = DayStatus.RENTED;
            } else {
                if (rule == null || rule.ruleType == null) {
                    status = blockedDates.contains(date) ? DayStatus.UNAVAILABLE : DayStatus.AVAILABLE;
                } else {
                    DayOfWeek dow = date.getDayOfWeek();
                    boolean availableByRule = switch (rule.ruleType) {
                        case Siempre           -> true;
                        case No_disponible     -> false;
                        case Lunes_a_Viernes   -> dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY;
                        case Fines_de_semana   -> dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY;
                    };
                    status = availableByRule ? DayStatus.AVAILABLE : DayStatus.UNAVAILABLE;
                }
            }

            days.add(new ToolCalendarDayDTO(date, status));
        }

        ToolCalendarResponseDTO response = new ToolCalendarResponseDTO();
        response.setRuleType(rule != null ? rule.ruleType.name() : null);
        response.setExceptions(exceptions.stream().map(e -> e.date).toList());
        response.setDays(days);

        return Response.ok(HttpBodyResponse.builder()
                .data(response)
                .build()).build();
    }

    public boolean isToolAvailable(Long toolId, LocalDate startDate, LocalDate endDate) {

        ToolAvailabilityRule rule = ruleRepo.findByToolId(toolId);

        List<ToolAvailabilityException> exceptions = exceptionRepo.findByToolIdAndRange(toolId, startDate, endDate);
        List<Rental> activeRentals = rentalRepo.findActiveByToolIdAndRange(toolId, startDate, endDate);

        Set<LocalDate> rentedDays = new HashSet<>();
        for (Rental r : activeRentals) {
            if (r.status == RentalStatus.Aprobada || r.status == RentalStatus.En_Uso) {
                r.startDate.datesUntil(r.endDate.plusDays(1)).forEach(rentedDays::add);
            }
        }

        Set<LocalDate> blockedDates = exceptions.stream()
                .map(e -> e.date)
                .collect(Collectors.toSet());

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {

            if (rentedDays.contains(date)) {
                return false;
            }

            if (rule == null || rule.ruleType == null) {
                if (blockedDates.contains(date)) {
                    return false;
                }
            } else {
                DayOfWeek dow = date.getDayOfWeek();
                boolean availableByRule = switch (rule.ruleType) {
                    case Siempre -> true;
                    case No_disponible -> false;
                    case Lunes_a_Viernes -> dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY;
                    case Fines_de_semana -> dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY;
                };

                if (!availableByRule) {
                    return false;
                }
            }
        }

        return true;
    }
}