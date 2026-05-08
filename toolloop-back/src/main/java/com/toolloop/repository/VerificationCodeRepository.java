package com.toolloop.repository;

import com.toolloop.model.entity.VerificationCode;
import com.toolloop.model.enums.VerificationCodeType;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import java.time.Instant;
import java.util.Optional;

@Slf4j
@ApplicationScoped
public class VerificationCodeRepository {

    @Inject
    EntityManager em;

    public void persist(VerificationCode verificationCode) {
        em.persist(verificationCode);
    }

    public void deleteByRentalId(Long rentalId) {
        em.createQuery("DELETE FROM VerificationCode v WHERE v.rentalId = :rentalId")
                .setParameter("rentalId", rentalId)
                .executeUpdate();
    }

    public Optional<VerificationCode> findValidCode(Long rentalId, String code, VerificationCodeType type) {
        return em.createQuery(
                        "SELECT v FROM VerificationCode v " +
                                "WHERE v.rentalId = :rentalId " +
                                "AND v.code = :code " +
                                "AND v.type = :type " +
                                "AND v.usedAt IS NULL " +
                                "AND v.expiresAt > :now", VerificationCode.class)
                .setParameter("rentalId", rentalId)
                .setParameter("code", code)
                .setParameter("type", type)
                .setParameter("now", Instant.now())
                .getResultStream()
                .findFirst();
    }

}