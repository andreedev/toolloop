package com.toolloop.repository;

import com.toolloop.model.entity.Review;
import com.toolloop.model.enums.ReviewType;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ReviewRepository extends BaseRepository<Review> {

    @Inject
    EntityManager em;

    public BigDecimal findAverageUserGeneralRating(Long userId) {
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

    public BigDecimal findAverageToolRating(Long toolId) {
        Double average = em.createQuery(
                        "SELECT AVG(r.toolRating) FROM Review r JOIN Rental rt ON r.rentalId = rt.rentalId " +
                                "WHERE rt.toolId = :toolId AND r.reviewType = :type", Double.class)
                .setParameter("toolId", toolId)
                .setParameter("type", ReviewType.RENTER_TO_OWNER)
                .getSingleResult();

        return formatRating(average);
    }

    private BigDecimal formatRating(Double value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP);
        }
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP);
    }

    public List<Review> findByToolId(Long toolId) {
        return em.createQuery(
                        "SELECT r FROM Review r " +
                                "JOIN Rental ren ON r.rentalId = ren.rentalId " +
                                "WHERE ren.toolId = :toolId " +
                                "AND r.reviewType = :type", Review.class)
                .setParameter("toolId", toolId)
                .setParameter("type", ReviewType.RENTER_TO_OWNER)
                .getResultList();
    }

    public Optional<Review> findByRentalIdAndReviewerId(Long rentalId, Long reviewerId) {
        return em().createQuery(
                        "SELECT r FROM Review r WHERE r.rentalId = :rentalId AND r.reviewerId = :reviewerId",
                        Review.class)
                .setParameter("rentalId", rentalId)
                .setParameter("reviewerId", reviewerId)
                .getResultStream()
                .findFirst();
    }

    public Boolean findByRentalId(Long rentalId, ReviewType reviewType) {
        return em().createQuery(
                        "SELECT COUNT(r) FROM Review r WHERE r.rentalId = :rentalId AND r.reviewType = :reviewType",
                        Long.class)
                .setParameter("rentalId", rentalId)
                .setParameter("reviewType", reviewType)
                .getSingleResult() > 0;
    }

    public BigDecimal findAverageRatingForUserAsOwner(Long userId) {
        try {
            Double average = em.createQuery(
                            "SELECT AVG(r.userRating) FROM Review r " +
                                    "WHERE r.revieweeId = :userId AND r.reviewType = :type",
                            Double.class)
                    .setParameter("userId", userId)
                    .setParameter("type", ReviewType.RENTER_TO_OWNER)
                    .getSingleResult();

            return formatRating(average);
        } catch (NoResultException | NullPointerException e) {
            return BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP);
        }
    }

    public BigDecimal findAverageRatingForUserAsRenter(Long userId) {
        try {
            Double average = em.createQuery(
                            "SELECT AVG(r.userRating) FROM Review r " +
                                    "WHERE r.revieweeId = :userId AND r.reviewType = :type",
                            Double.class)
                    .setParameter("userId", userId)
                    .setParameter("type", ReviewType.OWNER_TO_RENTER)
                    .getSingleResult();

            return formatRating(average);
        } catch (NoResultException | NullPointerException e) {
            return BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP);
        }
    }

    public List<Review> findByRevieweeId(Long userId) {
        return em.createQuery(
                        "SELECT r FROM Review r WHERE r.revieweeId = :userId",
                        Review.class)
                .setParameter("userId", userId)
                .getResultList();
    }
}
