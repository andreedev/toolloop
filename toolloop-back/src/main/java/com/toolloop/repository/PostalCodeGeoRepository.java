package com.toolloop.repository;

import com.toolloop.model.entity.PostalCodeGeo;
import com.toolloop.model.entity.User;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class PostalCodeGeoRepository {

    @Inject
    EntityManager em;

    public List<PostalCodeGeo> listAll() {
        return em.createQuery("SELECT p FROM PostalCodeGeo p", PostalCodeGeo.class).getResultList();
    }

    public List<PostalCodeGeo> searchByPostalCodeOrCity(String query) {
        return em.createQuery("SELECT p FROM PostalCodeGeo p WHERE p.postalCode LIKE :query OR p.city LIKE :query", PostalCodeGeo.class)
                .setParameter("query", "%" + query + "%")
                .getResultList();
    }
}
