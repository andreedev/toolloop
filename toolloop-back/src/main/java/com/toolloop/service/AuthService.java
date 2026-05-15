package com.toolloop.service;

import com.toolloop.constants.Constants;
import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.model.dto.SignUpRequest;
import com.toolloop.model.entity.SessionToken;
import com.toolloop.model.entity.User;
import com.toolloop.model.entity.UserNotificationConfig;
import com.toolloop.model.entity.EmailVerificationToken;
import com.toolloop.repository.EmailVerificationTokenRepository;
import com.toolloop.repository.TokenRepository;
import com.toolloop.repository.UserNotificationConfigRepository;
import com.toolloop.repository.UserRepository;
import com.toolloop.util.EmailTemplates;
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
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@ApplicationScoped
public class AuthService {

    @Inject
    UserRepository userRepository;

    @Inject
    TokenRepository tokenRepository;

    @Inject
    UserNotificationConfigRepository userNotificationConfigRepository;

    @Inject
    EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Inject
    EmailService emailService;

    @Inject
    JwtUtil jwtUtil;

    @ConfigProperty(name = "aws.s3.filesBucketName")
    String filesBucketName;

    @ConfigProperty(name = "app.base.url")
    String appBaseUrl;

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

        UserNotificationConfig notificationConfig = new UserNotificationConfig();
        notificationConfig.userId = newUser.getId();
        userNotificationConfigRepository.persist(notificationConfig);

        String baseProfilePhotoKey = Constants.USER_AVATARS_DIR + "/";
        String profilePhotoKey = request.getProfilePhotoKey();
        String profilePhotoPresignedUrl = null;
        if (profilePhotoKey != null && !profilePhotoKey.isBlank()) {
            String profilePhotoFilename = UUID.randomUUID() + FileUtils.getExtension(profilePhotoKey);
            profilePhotoKey = baseProfilePhotoKey + profilePhotoFilename;
            String contentType = FileUtils.getContentTypeFromExtension(profilePhotoKey);
            profilePhotoPresignedUrl = S3Service.createUploadPresignedUrl(
                    profilePhotoKey, filesBucketName, true, contentType
            );
        }
        String evToken = UUID.randomUUID().toString();
        EmailVerificationToken emailVerificationToken = EmailVerificationToken.builder()
                .userId(newUser.getId())
                .token(evToken)
                .expiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                .build();
        emailVerificationTokenRepository.persist(emailVerificationToken);

        String verificationUrl = appBaseUrl + "/auth/verify-email?token=" + evToken;
        emailService.sendEmail(
            newUser.getEmail(), newUser.getName(),
            EmailTemplates.subjectConfirmation(),
            EmailTemplates.confirmation(newUser.getName(), verificationUrl)
        );

        Map<String, String> signupData = new HashMap<>();
        if (profilePhotoPresignedUrl != null) {
            signupData.put("profilePhotoPresignedUrl", profilePhotoPresignedUrl);
        }

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
    public Response verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(HttpBodyResponse.builder().message("Token inválido").build()).build();
        }
        Optional<EmailVerificationToken> opt = emailVerificationTokenRepository.findByToken(token);
        if (opt.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(HttpBodyResponse.builder().message("Token inválido").build()).build();
        }
        EmailVerificationToken evt = opt.get();
        if (evt.usedAt != null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(HttpBodyResponse.builder().message("El enlace ya fue utilizado").build()).build();
        }
        if (Instant.now().isAfter(evt.expiresAt)) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(HttpBodyResponse.builder().message("El enlace ha expirado").build()).build();
        }
        User user = userRepository.findById(evt.userId)
                .orElseThrow(() -> new javax.ws.rs.WebApplicationException("Usuario no encontrado", Response.Status.NOT_FOUND));
        user.isEmailVerified = true;
        userRepository.update(user);
        evt.usedAt = Instant.now();
        emailVerificationTokenRepository.update(evt);

        emailService.sendEmail(
            user.getEmail(), user.getName(),
            EmailTemplates.subjectWelcome(),
            EmailTemplates.welcome(user.getName())
        );

        String sessionToken = generateAndPersistSession(user);
        return Response.ok(HttpBodyResponse.builder()
                .data(Map.of("sessionToken", sessionToken))
                .build()).build();
    }

    @Transactional
    public Response loginUser(User request) {
        Optional<User> user = userRepository.findByEmail(request.getEmail());

        if (user.isEmpty()) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(HttpBodyResponse.builder()
                            .message("Credenciales inválidas")
                            .build())
                    .build();
        }

        User u = user.get();
        if (!BCrypt.checkpw(request.getPassword(), u.getPassword())) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(HttpBodyResponse.builder()
                            .message("Credenciales inválidas")
                            .build())
                    .build();
        }
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
