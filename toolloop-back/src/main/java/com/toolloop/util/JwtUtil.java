package com.toolloop.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.toolloop.constants.Constants;
import io.smallrye.jwt.build.Jwt;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.enterprise.context.ApplicationScoped;
import java.util.Arrays;
import java.util.HashSet;

@ApplicationScoped
public class JwtUtil {

    @ConfigProperty(name = "jwt.secret.key")
    String jwtSecretKey;

    public String generateToken(String email, String userId) {
        return Jwt.claims()
                .issuer("https://toolloop.com")
                .subject(userId)
                .upn(email)
                .groups(new HashSet<>(Arrays.asList("User")))
                .expiresIn(Constants.EXPIRATION_SECONDS)
                .signWithSecret(jwtSecretKey);
    }

    public DecodedJWT parseToken(String token) {
        Algorithm algorithm = Algorithm.HMAC256(jwtSecretKey);
        return JWT.require(algorithm)
                .withIssuer("https://toolloop.com")
                .build()
                .verify(token);
    }
}
