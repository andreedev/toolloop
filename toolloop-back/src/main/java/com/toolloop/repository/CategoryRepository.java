package com.toolloop.repository;

import com.toolloop.model.entity.Category;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class CategoryRepository {

    @Inject
    EntityManager em;

    @ConfigProperty(name = "aws.s3.filesBucketName")
    String filesBucketName;

    public Optional<Category> findById(Long categoryId) {
        return Optional.ofNullable(em.find(Category.class, categoryId));
    }

    public List<Category> findAll() {
        return em.createQuery("SELECT c FROM Category c", Category.class).getResultList();
    }

    public List<Category> findAllWithIconResolved(){
        List<Category> categories = findAll();
        for (Category category : categories) {
            category.setIconKey(resolveIconUrl(category.getIconKey()));
        }
        return categories;
    }

    private String resolveIconUrl(String iconKey) {
        return "https://" + filesBucketName + ".s3.amazonaws.com/" + iconKey;
    }

}
