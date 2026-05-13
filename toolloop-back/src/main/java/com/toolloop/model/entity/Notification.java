package com.toolloop.model.entity;

import com.toolloop.model.enums.NotificationType;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.Instant;

@RegisterForReflection
@Data
@NoArgsConstructor
@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    public Long notificationId;

    @Column(name = "user_id", nullable = false)
    public Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, columnDefinition = "ENUM('RENTAL_REQUEST', 'RENTAL_REQUEST_CONFIRMATION', 'RENTAL_REQUEST_REJECTED', 'RETURN_REMINDER', 'REVIEW_RECEIVED', 'OTHER')")
    public NotificationType type;

    @Column(name = "title", nullable = false)
    public String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    public String message;

    @Column(name = "`read`")
    public Boolean read = false;

    @Column(name = "redirect_path")
    public String redirectPath;

    @Column(name = "created_at", insertable = false, updatable = false)
    public Instant createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    public Instant updatedAt;
}
