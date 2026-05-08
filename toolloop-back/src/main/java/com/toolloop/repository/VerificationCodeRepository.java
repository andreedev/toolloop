package com.toolloop.repository;

import com.toolloop.model.entity.VerificationCode;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;

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
}