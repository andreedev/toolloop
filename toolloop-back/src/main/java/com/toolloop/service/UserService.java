package com.toolloop.service;

import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.model.entity.User;
import com.toolloop.repository.UserRepository;
import com.toolloop.util.ContextUtils;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.core.Response;
import java.util.Optional;

@Slf4j
@ApplicationScoped
public class UserService {

    @Inject
    UserRepository userRepository;

    @Inject
    ContextUtils contextUtils;

    public Response getUserInfo() {
        Long userId = contextUtils.getUserId();

        if (userId == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return Response.ok(HttpBodyResponse.builder()
                    .data(user)
                    .build()).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }
}