package com.toolloop.service;

import com.toolloop.model.dto.ToolCalendarDayDTO;
import com.toolloop.model.dto.ToolCalendarResponseDTO;
import com.toolloop.model.entity.Rental;
import com.toolloop.model.entity.ToolAvailabilityException;
import com.toolloop.model.entity.ToolAvailabilityRule;
import com.toolloop.model.enums.DayStatus;
import com.toolloop.repository.RentalRepository;
import com.toolloop.repository.ToolAvailabilityExceptionRepository;
import com.toolloop.repository.ToolAvailabilityRuleRepository;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@ApplicationScoped
public class ToolAvailabilityService {

    @Inject ToolAvailabilityRuleRepository ruleRepo;

    @Inject
    ToolAvailabilityExceptionRepository exceptionRepo;

    @Inject RentalRepository rentalRepo;

    public ToolCalendarResponseDTO getCalendar(Long toolId, YearMonth month) {
        LocalDate start = month.atDay(1);
        LocalDate end   = month.atEndOfMonth();

        // 3 queries planas
        ToolAvailabilityRule rule        = ruleRepo.findByToolId(toolId);
        List<ToolAvailabilityException> exceptions = exceptionRepo.findByToolIdAndMonth(toolId, start, end);
        List<Rental> activeRentals       = rentalRepo.findActiveByToolIdAndRange(toolId, start, end);

        // Sets para lookup O(1)
        Set<LocalDate> exceptionAvailable   = new HashSet<>();
        Set<LocalDate> exceptionUnavailable = new HashSet<>();
        for (ToolAvailabilityException e : exceptions) {
            if (e.isAvailable) exceptionAvailable.add(e.date);
            else               exceptionUnavailable.add(e.date);
        }

        Set<LocalDate> rentedDays = new HashSet<>();
        for (Rental r : activeRentals) {
            // solo Aprobada + En_Uso
            if (r.status == Rental.RentalStatus.Aprobada || r.status == Rental.RentalStatus.En_Uso) {
                r.startDate.datesUntil(r.endDate.plusDays(1))
                        .forEach(rentedDays::add);
            }
        }

        // Calcular estado de cada día
        List<ToolCalendarDayDTO> days = new ArrayList<>();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {

            DayStatus status;

            if (rentedDays.contains(date)) {
                status = DayStatus.RENTED;

            } else if (exceptionAvailable.contains(date)) {
                status = DayStatus.AVAILABLE;

            } else if (exceptionUnavailable.contains(date)) {
                status = DayStatus.UNAVAILABLE;

            } else {
                // Aplicar regla base
                DayOfWeek dow = date.getDayOfWeek();
                boolean availableByRule = switch (rule.ruleType) {
                    case Siempre    -> true;
                    case No_disponible     -> false;
                    case Lunes_a_Viernes  -> dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY;
                    case Fines_de_semana  -> dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY;
                };
                status = availableByRule ? DayStatus.AVAILABLE : DayStatus.UNAVAILABLE;
            }

            days.add(new ToolCalendarDayDTO(date, status));
        }

        // Construir respuesta
        ToolCalendarResponseDTO response = new ToolCalendarResponseDTO();
        response.setRuleType(rule.ruleType.name());
        response.setExceptions(exceptions.stream().map(e -> e.date).toList());
        response.setDays(days);
        return response;
    }
}