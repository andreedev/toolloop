package com.toolloop.service;

import com.toolloop.constants.Constants;
import com.toolloop.model.dto.*;
import com.toolloop.model.entity.*;
import com.toolloop.repository.*;
import com.toolloop.util.ContextUtils;
import com.toolloop.util.FileUtils;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.transaction.Transactional;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@ApplicationScoped
public class ToolFavoriteService {

    @Inject
    UserRepository userRepository;

    @Inject
    ToolRepository toolRepository;

    @Inject
    ToolPhotoRepository toolPhotoRepository;

    @Inject
    ToolFavoriteRepository toolFavoriteRepository;

    @Inject
    ContextUtils contextUtils;
    @Inject
    CategoryRepository categoryRepository;

    @Transactional
    public Response toggleToolFavorite(SecurityContext securityContext, Long toolId) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        Optional<ToolFavorite> existingFavorite = toolFavoriteRepository.findByUserIdAndToolId(currentUserId, toolId);
        HttpBodyResponse response = new HttpBodyResponse();

        if (existingFavorite.isPresent()) {
            toolFavoriteRepository.persistOrDelete(existingFavorite.get());
            response.setMessage("Tool removed from favorites");
        } else {
            ToolFavorite newFavorite = new ToolFavorite();
            newFavorite.setToolId(toolId);
            newFavorite.setUserId(currentUserId);
            toolFavoriteRepository.persistOrDelete(newFavorite);
            response.setMessage("Tool added to favorites");
        }

        return Response.ok(response).build();
    }

    public Response listFavoriteTools(SecurityContext securityContext) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        List<ToolFavorite> favoriteTools = toolFavoriteRepository.findByUserId(currentUserId);

        List<Category> categories = categoryRepository.findAllWithIconResolved();
        Map<Long, Category> categoryMap = categories.stream().collect(Collectors.toMap(c -> c.categoryId, c -> c));

        favoriteTools.stream().forEach(favoriteTool -> {
            Tool tool = toolRepository.findByIdWithFirstPhoto(favoriteTool.getToolId()).get();
            tool.category = categoryMap.get(tool.categoryId);
            favoriteTool.tool = tool;
        });
        return Response.ok(HttpBodyResponse.builder().data(favoriteTools).build()).build();
    }
}
