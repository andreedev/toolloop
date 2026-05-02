package com.toolloop.repository;

import com.toolloop.model.entity.PostalCodeGeo;
import com.toolloop.model.entity.User;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
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

    public Optional<PostalCodeGeo> findByPostalCode(String postalCode) {
        try {
            PostalCodeGeo result = em.createQuery(
                    "SELECT p FROM PostalCodeGeo p WHERE p.postalCode = :postalCode", PostalCodeGeo.class)
                    .setParameter("postalCode", postalCode)
                    .setMaxResults(1)
                    .getSingleResult();
            return Optional.of(result);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }
}
