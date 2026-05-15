package com.toolloop.repository;

import com.toolloop.model.entity.EmailVerificationToken;

import javax.enterprise.context.ApplicationScoped;
import javax.transaction.Transactional;
import java.util.Optional;

@ApplicationScoped
public class EmailVerificationTokenRepository extends BaseRepository<EmailVerificationToken> {

    @Transactional
    public void deleteByUserId(Long userId) {
        em.createQuery("DELETE FROM EmailVerificationToken t WHERE t.userId = :userId")
                .setParameter("userId", userId)
                .executeUpdate();
    }

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
