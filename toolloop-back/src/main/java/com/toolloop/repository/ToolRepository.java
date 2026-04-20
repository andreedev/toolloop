package com.toolloop.repository;

import com.toolloop.model.entity.Rental;
import com.toolloop.model.entity.Tool;
import com.toolloop.model.entity.User;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ToolRepository {

    @Inject
    EntityManager em;

    public Optional<Tool> findById(Long id) {
        return Optional.ofNullable(em.find(Tool.class, id));
    }

    @Transactional
    public void persist(Tool user) {
        em.persist(user);
    }

    public Integer countByOwnerId(Long userId) {
        String sql = "SELECT COUNT(*) " +
                "FROM tool t " +
                "WHERE t.owner_id = :userId";

        Object result = em.createNativeQuery(sql)
                .setParameter("userId", userId)
                .getSingleResult();

        return (result != null) ? Integer.parseInt(result.toString()) : 0;
    }

    public List<Tool> findRecentToolsByOwnerId(Long userId, int limit) {
        String sql = "SELECT t.* " +
                "FROM tool t " +
                "WHERE t.owner_id = :userId " +
                "ORDER BY t.created_at DESC " +
                "LIMIT :limit";

        return em.createNativeQuery(sql, Tool.class)
                .setParameter("userId", userId)
                .setParameter("limit", limit)
                .getResultList();
    }
}
