package com.toolloop.repository;

import com.toolloop.model.entity.ToolAvailabilityRule;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.transaction.Transactional;

@ApplicationScoped
public class ToolAvailabilityRuleRepository {

    @Inject
    EntityManager em;

    public void persist(ToolAvailabilityRule entity) {
        em.persist(entity);
    }

    public void deleteByToolId(Long toolId) {
        em.createQuery("DELETE FROM ToolAvailabilityRule r WHERE r.toolId = :toolId")
                .setParameter("toolId", toolId)
                .executeUpdate();
    }

    public ToolAvailabilityRule findByToolId(Long toolId) {
        try {
            return em.createQuery("SELECT r FROM ToolAvailabilityRule r WHERE r.toolId = :toolId", ToolAvailabilityRule.class)
                    .setParameter("toolId", toolId)
                    .getSingleResult();
        } catch (Exception e) {
            return null;
        }
    }
}
