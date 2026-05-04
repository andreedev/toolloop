package com.toolloop.repository;

import com.toolloop.model.entity.User;
import org.eclipse.microprofile.config.inject.ConfigProperty;

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

    @ConfigProperty(name = "aws.s3.filesBucketName")
    String filesBucketName;

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
            user.setProfilePhotoKey("https://" + filesBucketName + ".s3.amazonaws.com/" + user.getProfilePhotoKey());
        }
        return Optional.ofNullable(user);
    }

    @Transactional
    public void persist(User user) {
        em.persist(user);
    }

}
