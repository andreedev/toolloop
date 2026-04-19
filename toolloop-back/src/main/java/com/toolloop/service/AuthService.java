package com.toolloop.service;

import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.model.dto.SignUpRequest;
import com.toolloop.model.entity.SessionToken;
import com.toolloop.model.entity.User;
import com.toolloop.repository.TokenRepository;
import com.toolloop.repository.UserRepository;
import com.toolloop.util.FileUtils;
import com.toolloop.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.mindrot.jbcrypt.BCrypt;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.transaction.Transactional;
import javax.ws.rs.core.Response;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;

@Slf4j
@ApplicationScoped
public class AuthService {

    @Inject
    UserRepository userRepository;

    @Inject
    TokenRepository tokenRepository;

    @Inject
    JwtUtil jwtUtil;

    @ConfigProperty(name = "aws.s3.filesBucketName")
    String filesBucketName;

    @Transactional
    public Response signupUser(SignUpRequest request) {
        validateSignupRequest(request);
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());

        if (existingUser.isPresent()) {
            return Response.status(Response.Status.CONFLICT)
                    .entity(
                            HttpBodyResponse.builder()
                                    .message("Usuario con este correo ya existe")
                                    .build()
                    )
                    .build();
        }

        String encryptedPassword = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt());

        User newUser = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(encryptedPassword)
                .postalCode(request.getPostalCode())
                .profilePhotoKey(request.getProfilePhotoKey())
                .build();

        userRepository.persist(newUser);

        String profilePhotoKey = request.getProfilePhotoKey();
        String profilePhotoPresignedUrl = null;
        if (profilePhotoKey != null && !profilePhotoKey.isBlank()) {
            String contentType = FileUtils.getContentTypeFromExtension(profilePhotoKey);
            profilePhotoPresignedUrl = S3Service.createUploadPresignedUrl(
                    profilePhotoKey, filesBucketName, true, contentType
            );
        }
        String sessionToken = generateAndPersistSession(newUser);

        Map<String, String> signupData = Map.of(
                "profilePhotoPresignedUrl", profilePhotoPresignedUrl,
                "sessionToken", sessionToken
        );

        return Response.ok(
                HttpBodyResponse.builder()
                        .message("Usuario registrado exitosamente")
                        .data(signupData)
                        .build()
        ).build();
    }

    private void validateSignupRequest(SignUpRequest request) {
        if (request.getEmail() == null || request.getEmail().isEmpty()) {
            throw new IllegalArgumentException("El correo electrónico es obligatorio");
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("La contraseña es obligatoria");
        }
        if (request.getName() == null || request.getName().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        if (request.getPostalCode() == null || request.getPostalCode().isEmpty()) {
            throw new IllegalArgumentException("El código postal es obligatorio");
        }
    }

    @Transactional
    public Response loginUser(User request) {
        Optional<User> user = userRepository.findByEmail(request.getEmail());

        if (user.isEmpty()) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(HttpBodyResponse.builder()
                            .message("Usuario no encontrado")
                            .build())
                    .build();
        }

        User u = user.get();
        if (BCrypt.checkpw(request.getPassword(), u.getPassword())) {
            String jwt = generateAndPersistSession(u);

            Map<String, String> sessionData = Map.of(
                    "sessionToken", jwt
            );

            return Response.ok(
                    HttpBodyResponse.builder()
                            .message("Login exitoso")
                            .data(sessionData)
                            .build()
            ).build();
        } else {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(HttpBodyResponse.builder()
                            .message("Contraseña incorrecta")
                            .build())
                    .build();
        }
    }

    private String generateAndPersistSession(User user) {
        String jwt = jwtUtil.generateToken(user.getEmail(), String.valueOf(user.getId()));

        tokenRepository.deleteByUserId(user.getId());

        SessionToken sessionToken = new SessionToken();
        sessionToken.userId = user.getId();
        sessionToken.tokenValue = jwt;
        sessionToken.expiresAt = Instant.now().plus(1, ChronoUnit.DAYS);
        tokenRepository.persist(sessionToken);

        return jwt;
    }
}
