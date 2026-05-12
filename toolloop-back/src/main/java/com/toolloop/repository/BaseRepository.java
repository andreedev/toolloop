package com.toolloop.repository;

import lombok.extern.slf4j.Slf4j;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import java.util.List;
import java.util.Optional;

@Slf4j
public abstract class BaseRepository<T> {

    @Inject
    protected EntityManager em;

    protected abstract Class<T> getEntityClass();

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

    public void deleteById(Object id) {
        findById(id).ifPresent(this::delete);
    }

    public Optional<T> findById(Object id) {
        return Optional.ofNullable(em.find(getEntityClass(), id));
    }

    protected TypedQuery<T> query(String jpql) {
        return em.createQuery(jpql, getEntityClass());
    }

    protected <R> TypedQuery<R> query(String jpql, Class<R> resultClass) {
        return em.createQuery(jpql, resultClass);
    }

    protected TypedQuery<T> namedQuery(String name) {
        return em.createNamedQuery(name, getEntityClass());
    }

    @SuppressWarnings("unchecked")
    protected List<T> nativeSelect(String sql) {
        return em.createNativeQuery(sql, getEntityClass()).getResultList();
    }

    @SuppressWarnings("unchecked")
    protected Optional<T> nativeSingleResult(String sql) {
        List<T> results = em.createNativeQuery(sql, getEntityClass())
                .setMaxResults(1)
                .getResultList();
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    protected int nativeUpdate(String sql) {
        return em.createNativeQuery(sql).executeUpdate();
    }

    protected Query nativeUpdateQuery(String sql) {
        return em.createNativeQuery(sql);
    }
}