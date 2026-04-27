package com.toolloop.service;

import com.toolloop.model.dto.DashboardInfo;
import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.model.entity.Rental;
import com.toolloop.model.entity.Tool;
import com.toolloop.model.entity.User;
import com.toolloop.repository.RentalRepository;
import com.toolloop.repository.ReviewRepository;
import com.toolloop.repository.ToolRepository;
import com.toolloop.repository.UserRepository;
import com.toolloop.util.ContextUtils;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Slf4j
@ApplicationScoped
public class ToolService {

    @Inject
    UserRepository userRepository;

    @Inject
    ToolRepository toolRepository;

    @Inject
    ContextUtils contextUtils;

    public Response getToolDetails(SecurityContext securityContext) {
        Long userId = contextUtils.getUserId(securityContext);
        Optional<Tool> toolOpt = toolRepository.findById(userId);
        if (toolOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        Tool tool = toolOpt.get();
        return Response.ok(HttpBodyResponse.builder()
                .data(tool)
                .build()).build();
    }

    public Response getUserTools(SecurityContext securityContext) {
        Long userId = contextUtils.getUserId(securityContext);
        List<Tool> tools = toolRepository.findRecentToolsByOwnerId(userId, 10);
        return Response.ok(HttpBodyResponse.builder()
                .data(tools)
                .build()).build();
    }

}
