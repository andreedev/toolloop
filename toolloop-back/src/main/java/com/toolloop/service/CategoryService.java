package com.toolloop.service;

import com.toolloop.repository.CategoryRepository;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.core.Response;

@Slf4j
@ApplicationScoped
public class CategoryService {

    @Inject
    CategoryRepository categoryRepository;

    public Response listCategories() {
        var categories = categoryRepository.findAll();
        return Response.ok(categories).build();
    }
}
