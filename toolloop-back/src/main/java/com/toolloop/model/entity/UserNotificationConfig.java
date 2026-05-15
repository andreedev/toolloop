package com.toolloop.model.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
@AllArgsConstructor
@NoArgsConstructor
@Builder
@RegisterForReflection
@Data
@Entity
@Table(name = "user_notification_config")
public class UserNotificationConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "user_id", nullable = false)
    public Long userId;

    @Column(name = "enable_email_notifications")
    public Boolean enableEmailNotifications = true;

    @Column(name = "notify_on_new_rental_request")
    public Boolean notifyOnNewRentalRequest = true;

    @Column(name = "notify_on_rental_update")
    public Boolean notifyOnRentalUpdate = true;

    @Column(name = "notify_on_return_reminder")
    public Boolean notifyOnReturnReminder = true;

    @Column(name = "notify_on_new_review_received")
    public Boolean notifyOnNewReviewReceived = true;

    @Column(name = "notify_on_new_message")
    public Boolean notifyOnNewMessage = true;
}