package com.toolloop.repository;

import com.toolloop.model.entity.UserNotificationConfig;

import javax.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UserNotificationConfigRepository extends BaseRepository<UserNotificationConfig> {

    public UserNotificationConfig findByUserId(Long userId) {
        return em().createQuery("SELECT c FROM UserNotificationConfig c WHERE c.userId = :userId", UserNotificationConfig.class)
                .setParameter("userId", userId)
                .getSingleResult();
    }

}
