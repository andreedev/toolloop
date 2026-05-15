package com.toolloop.config;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection(
        targets = {
                com.mailjet.client.transactional.response.SendEmailsResponse.class,
                com.mailjet.client.transactional.TransactionalEmail.class,
                com.mailjet.client.transactional.SendEmailsRequest.class,
                com.mailjet.client.transactional.SendContact.class
        },
        classNames = {
                "com.mailjet.client.transactional.response.Message",
                "com.mailjet.client.errors.MailjetErrors"
        },
        serialization = true
)
public class MailjetNativeReflectionConfig {
}