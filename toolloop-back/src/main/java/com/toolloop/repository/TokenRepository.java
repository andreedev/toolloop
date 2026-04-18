package com.toolloop.repository;

import com.toolloop.model.entity.SessionToken;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import java.util.Optional;

@Slf4j
@ApplicationScoped
public class TokenRepository{

    @Inject
    EntityManager em;

    /**
     * Busca un token por su valor. Devuelve un Optional vacío si no se encuentra ningún token con ese valor.
     */
    public Optional<SessionToken> findByTokenValue(String tokenValue) {
        log.info("Buscando token por valor: {}", tokenValue);
        try {
            SessionToken sessionToken = em.createQuery(
                            "SELECT t FROM SessionToken t WHERE t.tokenValue = :tokenValue", SessionToken.class)
                    .setParameter("tokenValue", tokenValue)
                    .getSingleResult();
            return Optional.of(sessionToken);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }

    /**
     * Persiste un nuevo token en la base de datos. Debe ser llamado dentro de un límite @Transactional.
     */
    public void persist(SessionToken sessionToken) {
        em.persist(sessionToken);
    }

    /**
     * Elimina todos los tokens asociados a un userId específico. Devuelve el número de tokens eliminados. Debe ser llamado dentro de un límite @Transactional.
     */
    public int deleteByUserId(Long userId) {
        return em.createQuery("DELETE FROM SessionToken t WHERE t.userId = :userId")
                .setParameter("userId", userId)
                .executeUpdate();
    }
}