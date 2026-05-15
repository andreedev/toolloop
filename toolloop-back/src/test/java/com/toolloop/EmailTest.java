package com.toolloop;

import com.toolloop.service.EmailService;
import com.toolloop.util.EmailTemplates;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import javax.inject.Inject;
import java.math.BigDecimal;
import java.time.LocalDate;

@QuarkusTest
class EmailTest {

    @Inject
    EmailService emailService;

    private static final String TO_EMAIL = "andreedev2@gmail.com";
    private static final String TO_NAME = "Cris";

    @Disabled
    @Test
    void testSimpleEmail() {
        String html = """
                <h1 style="color: #2d3748; font-family: sans-serif;">¡Nueva Reserva!</h1>
                """;
        emailService.sendEmail(TO_EMAIL, TO_NAME, "Bienvenido a ToolLoop", html);
    }

    @Disabled
    @Test
    void testConfirmationEmail() {
        emailService.sendEmail(
            TO_EMAIL, TO_NAME,
            EmailTemplates.subjectConfirmation(),
            EmailTemplates.confirmation(TO_NAME, "847291")
        );
    }

    @Disabled
    @Test
    void testWelcomeEmail() {
        emailService.sendEmail(
            TO_EMAIL, TO_NAME,
            EmailTemplates.subjectWelcome(),
            EmailTemplates.welcome(TO_NAME)
        );
    }

    @Disabled
    @Test
    void testNewRentalRequestEmail() {
        emailService.sendEmail(
            TO_EMAIL, TO_NAME,
            EmailTemplates.subjectNewRentalRequest("Taladro Bosch Professional"),
            EmailTemplates.newRentalRequest(
                TO_NAME,
                "Carlos López",
                "Taladro Bosch Professional",
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 6, 5),
                new BigDecimal("87.50")
            )
        );
    }

    @Disabled
    @Test
    void testRequestConfirmedEmail() {
        emailService.sendEmail(
            TO_EMAIL, TO_NAME,
            EmailTemplates.subjectRequestConfirmed("Taladro Bosch Professional"),
            EmailTemplates.requestConfirmed(
                TO_NAME,
                "María Garrido",
                "Taladro Bosch Professional",
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 6, 5),
                new BigDecimal("87.50")
            )
        );
    }

    @Disabled
    @Test
    void testRequestRejectedEmail() {
        emailService.sendEmail(
            TO_EMAIL, TO_NAME,
            EmailTemplates.subjectRequestRejected("Lijadora Orbital"),
            EmailTemplates.requestRejected(
                TO_NAME,
                "María Garrido",
                "Lijadora Orbital",
                LocalDate.of(2026, 6, 10),
                LocalDate.of(2026, 6, 15)
            )
        );
    }

    @Disabled
    @Test
    void testReturnReminderEmail() {
        emailService.sendEmail(
            TO_EMAIL, TO_NAME,
            EmailTemplates.subjectReturnReminder("Taladro Bosch Professional"),
            EmailTemplates.returnReminder(
                TO_NAME,
                "Taladro Bosch Professional",
                LocalDate.of(2026, 6, 5),
                2
            )
        );
    }

    @Disabled
    @Test
    void testReviewReceivedEmail() {
        emailService.sendEmail(
            TO_EMAIL, TO_NAME,
            EmailTemplates.subjectNewReview("Carlos López"),
            EmailTemplates.reviewReceived(
                TO_NAME,
                "Carlos López",
                4,
                "Muy buena herramienta, perfectamente mantenida. La recomiendo sin dudarlo."
            )
        );
    }
}
