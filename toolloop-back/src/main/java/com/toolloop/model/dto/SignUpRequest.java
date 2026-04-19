package com.toolloop.model.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Data;
import lombok.NoArgsConstructor;

@RegisterForReflection
@Data
@NoArgsConstructor
public class SignUpRequest {
    private String name;
    private String email;
    private String password;
    private String postalCode;
    private String profilePhotoKey;
}