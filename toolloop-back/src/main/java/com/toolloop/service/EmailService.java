package com.toolloop.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.mailjet.client.ClientOptions;
import com.mailjet.client.MailjetClient;
import com.mailjet.client.errors.MailjetException;
import com.mailjet.client.transactional.*;
import com.mailjet.client.transactional.response.SendEmailsResponse;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.enterprise.context.ApplicationScoped;

@Slf4j
@ApplicationScoped
public class EmailService {

    @ConfigProperty(name = "mailjet.apiKeyPublic")
    String apiKeyPublic;

    @ConfigProperty(name = "mailjet.apiKeyPrivate")
    String apiKeyPrivate;

    @ConfigProperty(name = "app.mail.sender.email")
    String senderEmail;

    @ConfigProperty(name = "app.mail.sender.name")
    String senderName;

    public void sendEmail(String toEmail, String toName, String subject, String htmlContent) {
        try {
            ClientOptions options = ClientOptions.builder()
                    .apiKey(apiKeyPublic)
                    .apiSecretKey(apiKeyPrivate)
                    .build();

            MailjetClient client = new MailjetClient(options);

            TransactionalEmail message = TransactionalEmail
                    .builder()
                    .from(new SendContact(senderEmail, senderName))
                    .to(new SendContact(toEmail, toName))
                    .htmlPart(htmlContent)
                    .subject(subject)
                    .trackOpens(TrackOpens.ENABLED)
                    .trackClicks(TrackClicks.DISABLED)
                    .build();

            SendEmailsRequest request = SendEmailsRequest
                    .builder()
                    .message(message)
                    .build();

            SendEmailsResponse response = request.sendWith(client);

            ObjectMapper mapper = new ObjectMapper();
            mapper.enable(SerializationFeature.INDENT_OUTPUT);
            try {
                String fullJson = mapper.writeValueAsString(response);
                log.info("mailjet response details:\n{}", fullJson);
            } catch (Exception e) {
                log.error("could not serialize Mailjet response: {}", e.getMessage());
            }

            log.info("email sent to {}. Status: {}", toEmail, response.getMessages()[0].getStatus());

        } catch (MailjetException e) {
            log.error("failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }
}