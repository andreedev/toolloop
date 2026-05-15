package com.toolloop;

import com.toolloop.service.EmailService;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import javax.inject.Inject;

@QuarkusTest
class EmailTest {

    @Inject
    EmailService emailService;

    @Disabled
    @Test
    void testEmail() {
        String html = """
                <h1 style="color: #2d3748; font-family: sans-serif;">¡Nueva Reserva!</h1>
                """;
        emailService.sendEmail("mariaqingxuan@gmail.com", "dino", "Bienvenido a ToolLoop", html);
    }

}