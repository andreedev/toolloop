package com.toolloop.service;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import java.util.List;

@Slf4j
@ApplicationScoped
public class EmailService {

    @Inject
    Mailer mailer;

    public void sendEmail(String toEmail, String toName, String subject, String htmlContent) {
        try {
            mailer.send(
                Mail.withHtml(toEmail, subject, htmlContent)
                    .setTo(List.of(toName + " <" + toEmail + ">"))
            );
            log.info("email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }
}
