package com.toolloop.repository;

import com.toolloop.model.entity.User;
import com.toolloop.util.S3KeyResolver;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class UserRepository {

    @Inject
    EntityManager em;

    @Inject
    S3KeyResolver s3KeyResolver;

    public Optional<User> findByEmail(String email) {
        try {
            User user = em.createQuery(
                            "SELECT u FROM User u WHERE u.email = :email", User.class)
                    .setParameter("email", email)
                    .getSingleResult();
            return Optional.of(user);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }

    public Optional<User> findById(Long id) {
        User user = em.find(User.class, id);
        if (user != null && user.getProfilePhotoKey() != null) {
            user.setProfilePhotoKey(s3KeyResolver.toUrl(user.getProfilePhotoKey()));
        }
        return Optional.ofNullable(user);
    }

    @Transactional
    public void persist(User user) {
        em.persist(user);
    }

}
