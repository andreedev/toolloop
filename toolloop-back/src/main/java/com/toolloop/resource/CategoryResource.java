package com.toolloop.resource;

import com.toolloop.service.CategoryService;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/category")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class CategoryResource {

    @Inject
    CategoryService categoryService;

    @GET
    @Path("/")
    public Response listCategories() {
        return categoryService.listCategories();
    }

}
