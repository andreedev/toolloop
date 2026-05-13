package com.toolloop.repository;

import com.toolloop.model.entity.Notification;
import com.toolloop.model.entity.Rental;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import java.util.List;

@ApplicationScoped
public class NotificationRepository {

    @Inject
    EntityManager em;

    @Inject
    ToolRepository toolRepository;

    public void persist(Notification entity) {
        em.persist(entity);
    }


    public List<Notification> findByUserId(Long currentUserId) {
        return em.createQuery("SELECT n FROM Notification n WHERE n.userId = :userId ORDER BY n.createdAt DESC", Notification.class)
                .setParameter("userId", currentUserId)
                .getResultList();
    }
}
