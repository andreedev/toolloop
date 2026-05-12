package com.toolloop.repository;

import lombok.extern.slf4j.Slf4j;

import javax.inject.Inject;
import javax.persistence.EntityManager;

@Slf4j
public abstract class BaseRepository<T> {

    @Inject
    private EntityManager em;

    protected EntityManager em() {
        return em;
    }

    public void persist(T entity) {
        em.persist(entity);
    }

    public T update(T entity) {
        return em.merge(entity);
    }

    public void delete(T entity) {
        T managed = em.contains(entity) ? entity : em.merge(entity);
        em.remove(managed);
    }

}