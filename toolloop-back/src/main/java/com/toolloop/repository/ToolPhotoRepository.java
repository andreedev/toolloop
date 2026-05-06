package com.toolloop.repository;

import com.toolloop.model.entity.Tool;
import com.toolloop.model.entity.ToolPhoto;

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

    public Optional<ToolPhoto> findById(Long id) {
        return Optional.ofNullable(em.find(ToolPhoto.class, id));
    }

    @Transactional
    public void persist(ToolPhoto entity) {
        em.persist(entity);
    }
}
