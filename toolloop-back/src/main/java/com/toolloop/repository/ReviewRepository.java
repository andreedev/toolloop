package com.toolloop.repository;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import java.math.BigDecimal;

@ApplicationScoped
public class ReviewRepository {

    @Inject
    EntityManager em;

    public BigDecimal findAverageRatingByUserId(Long userId) {
        try {
            BigDecimal rating = (BigDecimal) em.createNativeQuery(
                            "SELECT AVG(rating) FROM review WHERE reviewee_id = :userId")
                    .setParameter("userId", userId)
                    .getSingleResult();
            if (rating != null) {
                return rating.setScale(1, BigDecimal.ROUND_HALF_UP);
            } else {
                return BigDecimal.ZERO.setScale(1);
            }
        } catch (NoResultException e) {
            return null;
        }
    }
}
