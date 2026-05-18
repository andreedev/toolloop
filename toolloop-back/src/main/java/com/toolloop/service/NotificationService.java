package com.toolloop.service;

import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.model.entity.Notification;
import com.toolloop.model.entity.Rental;
import com.toolloop.model.entity.Tool;
import com.toolloop.model.entity.User;
import com.toolloop.model.entity.UserNotificationConfig;
import com.toolloop.model.enums.NotificationType;
import com.toolloop.model.enums.RentalStatus;
import com.toolloop.model.enums.WebSocketEventType;
import com.toolloop.repository.ChatRoomRepository;
import com.toolloop.repository.NotificationRepository;
import com.toolloop.repository.UserNotificationConfigRepository;
import com.toolloop.repository.UserRepository;
import com.toolloop.resource.websocket.WebSocketManager;
import com.toolloop.util.ContextUtils;
import com.toolloop.util.EmailTemplates;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.transaction.Transactional;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.function.Function;

@ApplicationScoped
public class NotificationService {

    @Inject
    NotificationRepository notificationRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    UserNotificationConfigRepository userNotificationConfigRepository;

    @Inject
    EmailService emailService;

    @Inject
    WebSocketManager webSocketManager;

    @Inject
    ContextUtils contextUtils;
    @Inject
    ChatRoomRepository chatRoomRepository;

    public void notifyRentalRequested(User renter, Tool tool, Rental rental) {
        Notification notification = new Notification();
        notification.userId = tool.getOwnerId();
        notification.type = NotificationType.RENTAL_REQUEST;
        notification.title = "Nueva solicitud de alquiler";
        notification.message = String.format("%s quiere alquilar tu %s del %s.",
                renter.name,
                tool.name,
                buildDateRange(rental.startDate, rental.endDate));
        notification.read = false;
        notification.redirectPath = String.format("/app/my-tools/loans", rental.rentalId);
        notificationRepository.persist(notification);
        webSocketManager.sendToUser(notification.userId, WebSocketEventType.NOTIFICATION.getValue(), notification);

        if (emailEnabled(tool.getOwnerId(), c -> c.notifyOnNewRentalRequest)) {
            User owner = userRepository.findById(tool.getOwnerId()).orElse(null);
            if (owner != null) {
                emailService.sendEmail(
                    owner.getEmail(), owner.getName(),
                    EmailTemplates.subjectNewRentalRequest(tool.getName()),
                    EmailTemplates.newRentalRequest(owner.getName(), renter.getName(), tool.getName(), rental.startDate, rental.endDate, rental.totalAmount)
                );
            }
        }
    }

    public void notifyRentalStatusUpdated(Rental rental, RentalStatus rentalStatus) {
        Notification notification = new Notification();
        notification.userId = rental.getRenterId();
        notification.type = rentalStatus == RentalStatus.Aprobada ? NotificationType.RENTAL_REQUEST_CONFIRMATION : NotificationType.RENTAL_REQUEST_REJECTED;
        notification.title = (rentalStatus == RentalStatus.Aprobada ? "Alquiler aprobado" : "Alquiler rechazado");
        notification.message = rental.owner.name + " ha " + (rentalStatus == RentalStatus.Aprobada ? "aprobado" : "rechazado") + " tu solicitud de alquiler para el " + rental.tool.name + " del " + buildDateRange(rental.startDate, rental.endDate) + ".";
        notification.read = false;
        Long chatRoomId = chatRoomRepository.findByRentalId(rental.rentalId).get().roomId;
        notification.redirectPath = String.format("/app/chats/%d", chatRoomId);
        notificationRepository.persist(notification);
        webSocketManager.sendToUser(notification.userId, WebSocketEventType.NOTIFICATION.getValue(), notification);

        if (emailEnabled(rental.getRenterId(), c -> c.notifyOnRentalUpdate)) {
            User renter = userRepository.findById(rental.getRenterId()).orElse(null);
            if (renter != null) {
                if (rentalStatus == RentalStatus.Aprobada) {
                    emailService.sendEmail(
                        renter.getEmail(), renter.getName(),
                        EmailTemplates.subjectRequestConfirmed(rental.tool.getName()),
                        EmailTemplates.requestConfirmed(renter.getName(), rental.owner.getName(), rental.tool.getName(), rental.startDate, rental.endDate, rental.totalAmount)
                    );
                } else if (rentalStatus == RentalStatus.Rechazada) {
                    emailService.sendEmail(
                        renter.getEmail(), renter.getName(),
                        EmailTemplates.subjectRequestRejected(rental.tool.getName()),
                        EmailTemplates.requestRejected(renter.getName(), rental.owner.getName(), rental.tool.getName(), rental.startDate, rental.endDate)
                    );
                }
            }
        }
    }

    private boolean emailEnabled(Long userId, Function<UserNotificationConfig, Boolean> flag) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || !Boolean.TRUE.equals(user.isEmailVerified)) return false;
            UserNotificationConfig config = userNotificationConfigRepository.findByUserId(userId);
            return Boolean.TRUE.equals(config.enableEmailNotifications) && Boolean.TRUE.equals(flag.apply(config));
        } catch (Exception e) {
            return false;
        }
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

    public Response getNotificationsByUserId(SecurityContext securityContext) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        List<Notification> notifications = notificationRepository.findByUserId(currentUserId);
        return Response.ok(HttpBodyResponse.builder().data(notifications).build()).build();
    }

    @Transactional
    public Response markNotificationAsRead(SecurityContext securityContext, long notificationId) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        Notification notification = notificationRepository.findById(notificationId);
        if (notification.userId != currentUserId) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        notification.read = true;
        notificationRepository.persist(notification);
        return Response.ok().build();
    }

    @Transactional
    public Response markAllNotificationsAsRead(SecurityContext securityContext) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        notificationRepository.markAllNotificationsAsRead(currentUserId);
        return Response.ok().build();
    }
}
