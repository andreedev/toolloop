package com.toolloop.repository;

import com.toolloop.model.entity.Rental;
import com.toolloop.model.entity.Review;
import com.toolloop.model.entity.User;
import com.toolloop.util.S3KeyResolver;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class RentalRepository extends BaseRepository<Rental> {

    @Inject
    EntityManager em;

    @Inject
    ToolRepository toolRepository;

    @Inject
    S3KeyResolver s3KeyResolver;

    @Inject
    ReviewRepository reviewRepository;

    public BigDecimal findTotalEarningsByUserId(Long userId) {
        String sql = "SELECT COALESCE(SUM(r.subtotal_amount), 0) " +
                "FROM rental r " +
                "INNER JOIN tool t ON r.tool_id = t.tool_id " +
                "WHERE t.owner_id = :userId";

        Object result = em.createNativeQuery(sql)
                .setParameter("userId", userId)
                .getSingleResult();

        return (result != null) ? new BigDecimal(result.toString()) : BigDecimal.ZERO;
    }

    public Integer countByRenterId(Long userId) {
        String sql = "SELECT COUNT(*) " +
                "FROM rental r " +
                "WHERE r.renter_id = :userId";

        Object result = em.createNativeQuery(sql)
                .setParameter("userId", userId)
                .getSingleResult();

        return (result != null) ? Integer.parseInt(result.toString()) : 0;
    }

    public Integer countActiveRentalsByRenterId(Long userId) {
        String sql = "SELECT COUNT(*) " +
                "FROM rental r " +
                "WHERE r.renter_id = :userId " +
                "AND r.status IN ('Pendiente', 'Aprobada', 'En_Uso')";

        Object result = em.createNativeQuery(sql)
                .setParameter("userId", userId)
                .getSingleResult();

        return (result != null) ? Integer.parseInt(result.toString()) : 0;
    }

    public Optional<Rental> findNextExpiringRentalByRenterId(Long userId) {
        String sql = "SELECT r.* " +
                "FROM rental r " +
                "WHERE r.renter_id = :userId " +
                "AND r.status IN ('En_Uso') " +
                "ORDER BY r.end_date ASC " +
                "LIMIT 1";

        try {
            Rental rental = (Rental) em.createNativeQuery(sql, Rental.class)
                    .setParameter("userId", userId)
                    .getSingleResult();

            toolRepository.findByIdWithFirstPhoto(rental.getToolId())
                    .ifPresent(rental::setTool);

            return Optional.of(rental);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }

    public List<Rental> findActiveByToolIdAndRange(Long toolId, LocalDate start, LocalDate end) {
        String sql = "SELECT r.* " +
                "FROM rental r " +
                "WHERE r.tool_id = :toolId " +
                "AND r.status IN ('Aprobada', 'En_Uso') " +
                "AND r.start_date <= :endDate " +
                "AND r.end_date >= :startDate";

        return em.createNativeQuery(sql, Rental.class)
                .setParameter("toolId", toolId)
                .setParameter("startDate", start)
                .setParameter("endDate", end)
                .getResultList();
    }

    public List<Rental> findByOwnerId(Long currentUserId) {
        String sql = "SELECT r.* " +
                "FROM rental r " +
                "INNER JOIN tool t ON r.tool_id = t.tool_id " +
                "WHERE t.owner_id = :currentUserId " +
                "ORDER BY r.created_at DESC";

        List<Rental> rentals = em.createNativeQuery(sql, Rental.class)
                .setParameter("currentUserId", currentUserId)
                .getResultList();

        rentals.forEach(rental -> {
            toolRepository.findByIdWithFirstPhoto(rental.getToolId())
                    .ifPresent(rental::setTool);
            User renter = em.find(User.class, rental.getRenterId());
            renter.setProfilePhotoKey(s3KeyResolver.toUrl(renter.getProfilePhotoKey()));
            renter.setAverageRating(reviewRepository.findAverageUserRating(renter.getId()));
            rental.setRenter(renter);
        });

        return rentals;
    }

    public List<Rental> findByRenterId(Long currentUserId) {
        String sql = "FROM Rental WHERE renterId = :currentUserId " +
                "ORDER BY createdAt DESC";

        List<Rental> rentals = em.createQuery(sql, Rental.class)
                .setParameter("currentUserId", currentUserId)
                .getResultList();

        rentals.forEach(rental -> {
            toolRepository.findByIdWithFirstPhoto(rental.getToolId())
                    .ifPresent(rental::setTool);
            User owner = em.find(User.class, rental.getTool().getOwnerId());
            owner.setProfilePhotoKey(s3KeyResolver.toUrl(owner.getProfilePhotoKey()));
            rental.setOwner(owner);
            rental.calculateDaysRemaining();
        });

        return rentals;
    }

    public boolean existsAnyByToolId(Long toolId) {
        String sql = "SELECT COUNT(*) FROM rental WHERE tool_id = :toolId";

        Object result = em.createNativeQuery(sql)
                .setParameter("toolId", toolId)
                .getSingleResult();

        return (result != null) && Integer.parseInt(result.toString()) > 0;
    }

    public Optional<Rental> findById(Long rentalId) {
        return Optional.ofNullable(em.find(Rental.class, rentalId));
    }
}
