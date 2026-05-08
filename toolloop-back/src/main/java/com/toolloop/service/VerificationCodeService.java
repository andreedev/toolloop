package com.toolloop.service;

import com.toolloop.model.entity.*;
import com.toolloop.model.enums.RentalStatus;
import com.toolloop.model.enums.VerificationCodeType;
import com.toolloop.repository.NotificationRepository;
import com.toolloop.repository.VerificationCodeRepository;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.transaction.Transactional;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

@ApplicationScoped
public class VerificationCodeService {

    @Inject
    VerificationCodeRepository verificationCodeRepository;

    @Transactional
    public String generateHandoverCode(Long rentalId, VerificationCodeType type) {
        verificationCodeRepository.deleteByRentalId(rentalId);
        VerificationCode verificationCode = new VerificationCode();

        String code = generate6DigitsCode();

        verificationCode.code = code;
        verificationCode.rentalId = rentalId;
        verificationCode.type = type;
        verificationCode.expiresAt = Instant.now().plus(3, ChronoUnit.MINUTES);

        verificationCodeRepository.persist(verificationCode);

        return code;
    }

    private String generate6DigitsCode() {
        return String.format("%06d", (int)(Math.random() * 1000000));
    }
}