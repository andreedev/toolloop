package com.toolloop.repository;

import lombok.extern.slf4j.Slf4j;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import java.lang.reflect.ParameterizedType;
import java.util.Optional;

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

    public Optional<T> findById(Long id) {
        Class<T> entityClass = (Class<T>) ((ParameterizedType) getClass()
                .getGenericSuperclass())
                .getActualTypeArguments()[0];
        T entity = em.find(entityClass, id);
        return Optional.ofNullable(entity);
    }

}