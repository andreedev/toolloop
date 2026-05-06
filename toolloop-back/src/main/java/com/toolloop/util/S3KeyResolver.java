package com.toolloop.util;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class S3KeyResolver {

    @ConfigProperty(name = "aws.s3.filesBucketName")
    String filesBucketName;

    public String toUrl(String key) {
        return "https://" + filesBucketName + ".s3.amazonaws.com/" + key;
    }

    public String toUrlOrNull(String key) {
        return key != null ? toUrl(key) : null;
    }
}
