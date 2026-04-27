package com.toolloop.repository;

import com.toolloop.model.entity.ToolFavorite;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.transaction.Transactional;

@ApplicationScoped
public class FavoriteRepository {

    @Inject
    EntityManager em;

    @Transactional
    public void persist(ToolFavorite entity) {
        em.persist(entity);
    }

    public boolean isToolFavoritedByUser(Long id, Long toolId) {
        String sql = "SELECT COUNT(*) " +
                "FROM tool_favorite tf " +
                "WHERE tf.user_id = :userId AND tf.tool_id = :toolId";

        Object result = em.createNativeQuery(sql)
                .setParameter("userId", id)
                .setParameter("toolId", toolId)
                .getSingleResult();

        return (result != null) && Integer.parseInt(result.toString()) > 0;
    }
}
