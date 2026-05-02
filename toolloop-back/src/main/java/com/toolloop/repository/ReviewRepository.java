package com.toolloop.repository;

import com.toolloop.model.entity.Review;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import java.math.BigDecimal;
import java.math.RoundingMode;

@ApplicationScoped
public class ReviewRepository {

    @Inject
    EntityManager em;

    public BigDecimal findAverageUserRating(Long userId) {
        try {
            Double average = em.createQuery(
                            "SELECT AVG(r.userRating) FROM Review r WHERE r.revieweeId = :userId",
                            Double.class)
                    .setParameter("userId", userId)
                    .getSingleResult();

            return formatRating(average);
        } catch (NoResultException | NullPointerException e) {
            return BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP);
        }
    }

    public BigDecimal findAverageToolRatingByOwner(Long ownerId) {
        Double average = em.createQuery(
                        "SELECT AVG(r.toolRating) FROM Review r " +
                                "WHERE r.revieweeId = :ownerId AND r.reviewType = :type", Double.class)
                .setParameter("ownerId", ownerId)
                .setParameter("type", Review.ReviewType.RENTER_TO_OWNER)
                .getSingleResult();

        return formatRating(average);
    }

    private BigDecimal formatRating(Double value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP);
        }
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP);
    }
}
