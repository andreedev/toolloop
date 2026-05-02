package com.toolloop.repository;

import com.toolloop.model.entity.Tool;
import com.toolloop.model.entity.ToolPhoto;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ToolPhotoRepository {

    @Inject
    EntityManager em;

    @ConfigProperty(name = "aws.s3.filesBucketName")
    String filesBucketName;

    public Optional<ToolPhoto> findById(Long id) {
        return Optional.ofNullable(em.find(ToolPhoto.class, id));
    }

    @Transactional
    public void persist(ToolPhoto entity) {
        em.persist(entity);
    }
}
