package com.toolloop.repository;

import com.toolloop.model.entity.EmailVerificationToken;

import javax.enterprise.context.ApplicationScoped;
import java.util.Optional;

@ApplicationScoped
public class EmailVerificationTokenRepository extends BaseRepository<EmailVerificationToken> {

    public Optional<EmailVerificationToken> findByToken(String token) {
        return em.createQuery(
                "SELECT t FROM EmailVerificationToken t WHERE t.token = :token",
                EmailVerificationToken.class)
                .setParameter("token", token)
                .getResultList()
                .stream()
                .findFirst();
    }
}
