package com.toolloop.repository;

import com.toolloop.model.entity.Rental;
import com.toolloop.model.entity.User;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.util.Optional;

@ApplicationScoped
public class RentalRepository {

    @Inject
    EntityManager em;

    public Optional<Rental> findById(Long id) {
        return Optional.ofNullable(em.find(Rental.class, id));
    }

    @Transactional
    public void persist(Rental user) {
        em.persist(user);
    }


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
            return Optional.of(rental);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }
}
