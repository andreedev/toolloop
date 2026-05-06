package com.toolloop.repository;

import com.toolloop.model.entity.Notification;
import com.toolloop.model.entity.Rental;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;

@ApplicationScoped
public class NotificationRepository {

    @Inject
    EntityManager em;

    @Inject
    ToolRepository toolRepository;

    public void persist(Notification entity) {
        em.persist(entity);
    }


}
