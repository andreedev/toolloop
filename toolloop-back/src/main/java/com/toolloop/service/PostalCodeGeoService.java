package com.toolloop.service;

import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.model.entity.PostalCodeGeo;
import com.toolloop.model.entity.User;
import com.toolloop.repository.PostalCodeGeoRepository;
import com.toolloop.repository.UserRepository;
import com.toolloop.util.ContextUtils;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.core.Response;
import java.util.List;
import java.util.Optional;

@Slf4j
@ApplicationScoped
public class PostalCodeGeoService {

    @Inject
    PostalCodeGeoRepository postalCodeGeoRepository;

    @Inject
    ContextUtils contextUtils;

    public Response listAllPostalCodes() {
        List<PostalCodeGeo> postalCodes = postalCodeGeoRepository.listAll();
        return Response.ok(HttpBodyResponse.buildWithData(postalCodes)).build();
    }

    public Response searchPostalCodes(String query) {
        List<PostalCodeGeo> postalCodes = postalCodeGeoRepository.searchByPostalCodeOrCity(query);
        return Response.ok(HttpBodyResponse.buildWithData(postalCodes)).build();
    }

}