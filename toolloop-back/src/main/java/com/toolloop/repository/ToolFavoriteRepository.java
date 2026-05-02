package com.toolloop.repository;

import com.toolloop.model.entity.ToolFavorite;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import java.util.Optional;

@Slf4j
@ApplicationScoped
public class ToolFavoriteRepository {

    @Inject
    EntityManager em;

    @Transactional
    public void persistOrDelete(ToolFavorite toolFavorite) {
        if (toolFavorite.getToolFavoriteId() == null) {
            em.persist(toolFavorite);
        } else {
            em.remove(em.contains(toolFavorite) ? toolFavorite : em.merge(toolFavorite));
        }
    }

    public Optional<ToolFavorite> findByUserIdAndToolId(Long currentUserId, Long toolId) {
        try {
            ToolFavorite toolFavorite = em.createQuery("SELECT tf FROM ToolFavorite tf WHERE tf.userId = :userId AND tf.toolId = :toolId", ToolFavorite.class)
                    .setParameter("userId", currentUserId)
                    .setParameter("toolId", toolId)
                    .getSingleResult();
            return Optional.of(toolFavorite);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
