package com.toolloop.repository;

import com.toolloop.model.entity.Category;
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
public class CategoryRepository {

    @Inject
    EntityManager em;

    public Category findCategoryById(Long categoryId) {
        return em.find(Category.class, categoryId);
    }
}
