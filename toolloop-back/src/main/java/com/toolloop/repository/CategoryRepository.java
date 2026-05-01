package com.toolloop.repository;

import com.toolloop.model.entity.Category;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class CategoryRepository {

    @Inject
    EntityManager em;

    public Optional<Category> findById(Long categoryId) {
        return Optional.ofNullable(em.find(Category.class, categoryId));
    }

    public List<Category> findAll() {
        return em.createQuery("SELECT c FROM Category c", Category.class).getResultList();
    }

}
