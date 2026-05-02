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
import java.util.Optional;

@Slf4j
@ApplicationScoped
public class ToolFavoriteService {

    @Inject
    UserRepository userRepository;

    @Inject
    ToolFavoriteRepository toolFavoriteRepository;

    @Inject
    ContextUtils contextUtils;

    @ConfigProperty(name = "aws.s3.filesBucketName")
    String filesBucketName;

    @Transactional
    public Response toggleToolFavorite(SecurityContext securityContext, Long toolId) {
        Long currentUserId = contextUtils.getUserId(securityContext);
        User user = userRepository.findById(currentUserId).orElse(null);
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
}
