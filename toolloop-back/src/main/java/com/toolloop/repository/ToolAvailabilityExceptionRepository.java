package com.toolloop.repository;

import com.toolloop.model.entity.Tool;
import com.toolloop.model.entity.ToolAvailabilityException;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;

@ApplicationScoped
public class ToolAvailabilityExceptionRepository {

    @Inject
    EntityManager em;

    public void persist(ToolAvailabilityException entity) {
        em.persist(entity);
    }

    public void deleteByToolId(Long toolId) {
        em.createQuery("DELETE FROM ToolAvailabilityException e WHERE e.toolId = :toolId")
                .setParameter("toolId", toolId)
                .executeUpdate();
    }

    public List<ToolAvailabilityException> findByToolIdAndMonth(Long toolId, LocalDate start, LocalDate end) {
        return em.createQuery("SELECT e FROM ToolAvailabilityException e " +
                        "WHERE e.toolId = :toolId AND e.date BETWEEN :start AND :end", ToolAvailabilityException.class)
                .setParameter("toolId", toolId)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }

    public List<ToolAvailabilityException> findByToolIdAndRange(Long toolId, LocalDate start, LocalDate end) {
        return em.createQuery("SELECT e FROM ToolAvailabilityException e " +
                        "WHERE e.toolId = :toolId AND e.date >= :start AND e.date <= :end", ToolAvailabilityException.class)
                .setParameter("toolId", toolId)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }
}
