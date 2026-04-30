package com.toolloop.service;

import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.repository.CategoryRepository;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.core.Response;

@Slf4j
@ApplicationScoped
public class CategoryService {

    @Inject
    CategoryRepository categoryRepository;

    @ConfigProperty(name = "aws.s3.filesBucketName")
    String filesBucketName;

    public Response listCategories() {
        var categories = categoryRepository.findAll();
        categories.stream().forEach(category ->{
            category.setIconKey("https://" + filesBucketName + ".s3.amazonaws.com/" + category.getIconKey());
        });
        return Response.ok(HttpBodyResponse.builder()
                .data(categories)
                .build()
        ).build();
    }
}
