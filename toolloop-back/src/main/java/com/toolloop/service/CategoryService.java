package com.toolloop.service;

import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.repository.CategoryRepository;
import com.toolloop.util.S3KeyResolver;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.core.Response;

@Slf4j
@ApplicationScoped
public class CategoryService {

    @Inject
    CategoryRepository categoryRepository;

    @Inject
    S3KeyResolver s3KeyResolver;

    public Response listCategories() {
        var categories = categoryRepository.findAll();
        categories.stream().forEach(category ->{
            category.setIconKey(s3KeyResolver.toUrl(category.getIconKey()));
        });
        return Response.ok(HttpBodyResponse.builder()
                .data(categories)
                .build()
        ).build();
    }
}
