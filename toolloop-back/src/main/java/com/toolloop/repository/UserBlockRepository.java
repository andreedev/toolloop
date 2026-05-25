package com.toolloop.repository;

import com.toolloop.model.entity.UserBlock;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.transaction.Transactional;

@ApplicationScoped
public class UserBlockRepository extends BaseRepository<UserBlock> {

    @Inject
    EntityManager em;

    public boolean existsByBlockerIdAndBlockedId(Long blockerId, Long blockedId) {
        return em.createQuery("SELECT COUNT(ub) FROM UserBlock ub WHERE ub.blockerId = :blockerId AND ub.blockedId = :blockedId", Long.class)
                .setParameter("blockerId", blockerId)
                .setParameter("blockedId", blockedId)
                .getSingleResult() > 0;
    }

    @Transactional
    public void deleteByBlockerIdAndBlockedId(Long blockerId, Long blockedId) {
        em.createQuery("DELETE FROM UserBlock ub WHERE ub.blockerId = :blockerId AND ub.blockedId = :blockedId")
                .setParameter("blockerId", blockerId)
                .setParameter("blockedId", blockedId)
                .executeUpdate();
    }
}
