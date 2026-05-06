package com.toolloop.service;

import com.toolloop.model.entity.Notification;
import com.toolloop.model.entity.Rental;
import com.toolloop.model.entity.Tool;
import com.toolloop.model.entity.User;
import com.toolloop.repository.NotificationRepository;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@ApplicationScoped
public class NotificationService {

    @Inject
    NotificationRepository notificationRepository;

    public void notifyRentalRequested(User renter, Tool tool, Rental rental) {
        Notification notification = new Notification();
        notification.userId = tool.getOwnerId();
        notification.title = "Nueva solicitud de alquiler";
        notification.message = String.format("%s quiere alquilar tu %s del %s.",
                renter.name,
                tool.name,
                buildDateRange(rental.startDate, rental.endDate));
        notification.read = false;
        notification.redirectPath = String.format("/my-tools/loans?rentalId=%d", rental.rentalId);
        notificationRepository.persist(notification);
    }

    private String buildDateRange(LocalDate start, LocalDate end) {
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMMM", new Locale("es", "ES"));
        if (start.getMonth() == end.getMonth()) {
            return String.format("%d al %d de %s",
                    start.getDayOfMonth(),
                    end.getDayOfMonth(),
                    end.format(monthFormatter));
        }
        return String.format("%d de %s al %d de %s",
                start.getDayOfMonth(),
                start.format(monthFormatter),
                end.getDayOfMonth(),
                end.format(monthFormatter));
    }
}
