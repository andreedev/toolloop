package com.toolloop.repository;

import com.toolloop.model.entity.ToolAvailabilityException;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import java.time.LocalDate;
import java.util.List;

@ApplicationScoped
public class ToolAvailabilityExceptionRepository {

    @Inject
    EntityManager em;

    public List<ToolAvailabilityException> findByToolIdAndMonth(Long toolId, LocalDate start, LocalDate end) {
        return em.createQuery("SELECT e FROM ToolAvailabilityException e " +
                        "WHERE e.toolId = :toolId AND e.date BETWEEN :start AND :end", ToolAvailabilityException.class)
                .setParameter("toolId", toolId)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }
}
