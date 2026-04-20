package com.toolloop.repository;

import com.toolloop.model.entity.Tool;
import com.toolloop.model.entity.ToolPhoto;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ToolRepository {

    @Inject
    EntityManager em;

    @ConfigProperty(name = "aws.s3.filesBucketName")
    String filesBucketName;

    @Inject
    CategoryRepository categoryRepository;

    public Optional<Tool> findById(Long id) {
        return Optional.ofNullable(em.find(Tool.class, id));
    }

    @Transactional
    public void persist(Tool user) {
        em.persist(user);
    }

    public Integer countByOwnerId(Long userId) {
        String sql = "SELECT COUNT(*) " +
                "FROM tool t " +
                "WHERE t.owner_id = :userId";

        Object result = em.createNativeQuery(sql)
                .setParameter("userId", userId)
                .getSingleResult();

        return (result != null) ? Integer.parseInt(result.toString()) : 0;
    }

    public Optional<Tool> findByIdWithFirstPhoto(Long toolId) {
        Tool tool = em.find(Tool.class, toolId);
        if (tool == null) return Optional.empty();

        List<ToolPhoto> first = findPhotosByToolId(tool.getToolId());
        tool.setPhotos(first.isEmpty() ? List.of() : List.of(first.get(0)));
        tool.setIsReserved(isToolReserved(tool.getToolId()));

        return Optional.of(tool);
    }

    public List<Tool> findRecentToolsByOwnerId(Long ownerId, int limit) {
        String sql = "SELECT * FROM tool WHERE owner_id = :ownerId ORDER BY created_at DESC LIMIT :limit";

        List<Tool> tools = em.createNativeQuery(sql, Tool.class)
                .setParameter("ownerId", ownerId)
                .setParameter("limit", limit)
                .getResultList();

        tools.forEach(tool -> {
            tool.setPhotos(findPhotosByToolId(tool.getToolId()));
            tool.setIsReserved(isToolReserved(tool.getToolId()));
            tool.setReviewCount(countReviewsByToolId(tool.getToolId()));
            tool.setCategory(categoryRepository.findCategoryById(tool.getCategoryId()));
        });


        return tools;
    }

    public List<Tool> findRecentToolsByOwnerIdWithFirstPhoto(Long ownerId, int limit) {
        String sql = "SELECT * FROM tool WHERE owner_id = :ownerId ORDER BY created_at DESC LIMIT :limit";

        List<Tool> tools = em.createNativeQuery(sql, Tool.class)
                .setParameter("ownerId", ownerId)
                .setParameter("limit", limit)
                .getResultList();

        tools.forEach(tool -> {
            List<ToolPhoto> first = findPhotosByToolId(tool.getToolId());
            tool.setPhotos(first.isEmpty() ? List.of() : List.of(first.get(0)));
            tool.setIsReserved(isToolReserved(tool.getToolId()));
        });

        return tools;
    }

    private List<ToolPhoto> findPhotosByToolId(Long toolId) {
        String sql = "SELECT * FROM tool_photo WHERE tool_id = :toolId ORDER BY created_at ASC";

        List<ToolPhoto> photos = em.createNativeQuery(sql, ToolPhoto.class)
                .setParameter("toolId", toolId)
                .getResultList();

        photos.forEach(photo ->
                photo.setPhotoKey("https://" + filesBucketName + ".s3.amazonaws.com/" + photo.getPhotoKey())
        );

        return photos;
    }

    private Boolean isToolReserved(Long toolId) {
        String sql = "SELECT COUNT(*) FROM rental " +
                "WHERE tool_id = :toolId " +
                "AND status IN ('Aprobada', 'En_Uso')";

        Object result = em.createNativeQuery(sql)
                .setParameter("toolId", toolId)
                .getSingleResult();

        return result != null && Integer.parseInt(result.toString()) > 0;
    }

    private Integer countReviewsByToolId(Long toolId) {
        String sql = "SELECT COUNT(*) FROM review rv " +
                "INNER JOIN rental r ON rv.rental_id = r.rental_id " +
                "WHERE r.tool_id = :toolId";

        Object result = em.createNativeQuery(sql)
                .setParameter("toolId", toolId)
                .getSingleResult();

        return result != null ? Integer.parseInt(result.toString()) : 0;
    }
}
