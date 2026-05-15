package com.toolloop.repository;

import com.toolloop.model.dto.OwnerToolDTO;
import com.toolloop.model.entity.Category;
import com.toolloop.model.entity.Tool;
import com.toolloop.model.entity.ToolPhoto;
import com.toolloop.model.enums.RentalStatus;
import com.toolloop.model.enums.ReviewType;
import com.toolloop.model.enums.ToolAvailabilityRuleType;
import com.toolloop.util.S3KeyResolver;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.Tuple;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@ApplicationScoped
public class ToolRepository extends BaseRepository<Tool> {

    @Inject
    EntityManager em;

    @Inject
    S3KeyResolver s3KeyResolver;

    @Inject
    CategoryRepository categoryRepository;

    public Boolean existsById(Long id) {
        String sql = "SELECT COUNT(*) FROM tool WHERE tool_id = :id";

        Object result = em.createNativeQuery(sql)
                .setParameter("id", id)
                .getSingleResult();

        return result != null && Integer.parseInt(result.toString()) > 0;
    }

    public Optional<Tool> findById(Long id) {
        return Optional.ofNullable(em.find(Tool.class, id));
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

        List<ToolPhoto> photos = List.of(findFirstPhotoByToolId(toolId));
        tool.setPhotos(photos);
        tool.setIsAvailable(isToolAvailable(tool.getToolId()));

        return Optional.of(tool);
    }

    public List<Tool> findRecentToolsByOwnerId(Long ownerId) {
        String sql = "SELECT * FROM tool WHERE owner_id = :ownerId ORDER BY created_at DESC";

        List<Tool> tools = em.createNativeQuery(sql, Tool.class)
                .setParameter("ownerId", ownerId)
                .getResultList();

        tools.forEach(tool -> {
            tool.setPhotos(findPhotosByToolId(tool.getToolId()));
            tool.setIsAvailable(isToolAvailable(tool.getToolId()));
            tool.setReviewCount(countReviewsByToolId(tool.getToolId()));
            tool.setCategory(categoryRepository.findById(tool.getCategoryId()).orElse(null));
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
            tool.setIsAvailable(isToolAvailable(tool.getToolId()));
        });

        return tools;
    }

    public List<ToolPhoto> findPhotosByToolId(Long toolId) {
        String sql = "SELECT * FROM tool_photo WHERE tool_id = :toolId ORDER BY created_at ASC";

        List<ToolPhoto> photos = em.createNativeQuery(sql, ToolPhoto.class)
                .setParameter("toolId", toolId)
                .getResultList();

        photos.forEach(photo ->
            photo.setPhotoKey(s3KeyResolver.toUrl(photo.getPhotoKey()))
        );

        return photos;
    }

    public ToolPhoto findFirstPhotoByToolId(Long toolId) {
        String sql = "SELECT * FROM tool_photo WHERE tool_id = :toolId ORDER BY created_at ASC LIMIT 1";

        List<ToolPhoto> photos = em.createNativeQuery(sql, ToolPhoto.class)
                .setParameter("toolId", toolId)
                .getResultList();

        if (photos.isEmpty()) {
            return null;
        }

        ToolPhoto photo = photos.get(0);
        photo.setPhotoKey(s3KeyResolver.toUrl(photo.getPhotoKey()));
        return photo;
    }

    public Boolean isToolAvailable(Long toolId) {
        try {
            Object result = em.createNativeQuery("""
            SELECT 
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM rental rt 
                        WHERE rt.tool_id = t.tool_id 
                        AND rt.status IN (:statusAprobada, :statusEnUso)
                        AND CURRENT_DATE BETWEEN rt.start_date AND rt.end_date
                    ) THEN 0
                    
                    WHEN r.rule_type = :ruleSiempre THEN 1
                    WHEN r.rule_type = :ruleLV THEN IF(DAYOFWEEK(CURRENT_DATE) BETWEEN 2 AND 6, 1, 0)
                    WHEN r.rule_type = :ruleFDS THEN IF(DAYOFWEEK(CURRENT_DATE) IN (1, 7), 1, 0)
                    WHEN r.rule_type = :ruleNoDisp THEN 0
                    
                    WHEN r.rule_type IS NULL THEN 
                        IF(NOT EXISTS (
                            SELECT 1 FROM tool_availability_exception e 
                            WHERE e.tool_id = t.tool_id AND e.date = CURRENT_DATE
                        ), 1, 0)
                    
                    ELSE 0 
                END as available
            FROM tool t
            LEFT JOIN tool_availability_rule r ON t.tool_id = r.tool_id
            WHERE t.tool_id = :toolId
            """)
                    .setParameter("toolId", toolId)
                    .setParameter("statusAprobada", RentalStatus.Aprobada.name())
                    .setParameter("statusEnUso", RentalStatus.En_Uso.name())
                    .setParameter("ruleSiempre", ToolAvailabilityRuleType.Siempre.name())
                    .setParameter("ruleLV", ToolAvailabilityRuleType.Lunes_a_Viernes.name())
                    .setParameter("ruleFDS", ToolAvailabilityRuleType.Fines_de_semana.name())
                    .setParameter("ruleNoDisp", ToolAvailabilityRuleType.No_disponible.name())
                    .getSingleResult();

            if (result instanceof Number n) {
                return n.intValue() == 1;
            }
            return (Boolean) result;

        } catch (NoResultException e) {
            return false;
        }
    }

    public Integer countReviewsByToolId(Long toolId) {
        String sql = "SELECT COUNT(*) FROM review rv " +
                "INNER JOIN rental r ON rv.rental_id = r.rental_id " +
                "WHERE r.tool_id = :toolId AND rv.review_type = :reviewType";

        Object result = em.createNativeQuery(sql)
                .setParameter("toolId", toolId)
                .setParameter("reviewType", ReviewType.RENTER_TO_OWNER.name())
                .getSingleResult();

        return result != null ? Integer.parseInt(result.toString()) : 0;
    }

    public boolean existsByOwnerIdAndName(Long id, String name) {
        String sql = "SELECT COUNT(*) FROM tool WHERE owner_id = :ownerId AND lower(name) = lower(:name)";

        Object result = em.createNativeQuery(sql)
                .setParameter("ownerId", id)
                .setParameter("name", name)
                .getSingleResult();

        return result != null && Integer.parseInt(result.toString()) > 0;
    }

    public List<Tool> findFeatured(int limit) {
        String sql = "SELECT t.* FROM tool t " +
                "LEFT JOIN rental r ON r.tool_id = t.tool_id " +
                "GROUP BY t.tool_id " +
                "ORDER BY COUNT(r.rental_id) DESC, t.created_at DESC " +
                "LIMIT :limit";

        List<Tool> tools = em.createNativeQuery(sql, Tool.class)
                .setParameter("limit", limit)
                .getResultList();

        tools.forEach(tool -> {
            ToolPhoto first = findFirstPhotoByToolId(tool.getToolId());
            tool.setPhotos(first == null ? List.of() : List.of(first));
            tool.setIsAvailable(isToolAvailable(tool.getToolId()));
        });

        return tools;
    }

    public List<Tool> findToolsForMap(String namePattern, Long categoryId, java.math.BigDecimal maxPrice, Long excludeOwnerId) {
        String sql = "SELECT t.* FROM tool t " +
                "INNER JOIN user u ON t.owner_id = u.user_id " +
                "INNER JOIN postal_code_geo p ON u.postal_code = p.postal_code " +
                "WHERE (:name IS NULL OR lower(t.name) LIKE lower(:name)) " +
                "AND (:categoryId IS NULL OR t.category_id = :categoryId) " +
                "AND (:maxPrice IS NULL OR t.price_per_day <= :maxPrice) " +
                "AND t.owner_id != :excludeOwnerId";

        List<Tool> tools = em.createNativeQuery(sql, Tool.class)
                .setParameter("name", namePattern)
                .setParameter("categoryId", categoryId)
                .setParameter("maxPrice", maxPrice)
                .setParameter("excludeOwnerId", excludeOwnerId)
                .getResultList();

        List<Category> categories = categoryRepository.findAllWithIconResolved();
        Map<Long, Category> categoryMap = categories.stream().collect(Collectors.toMap(c -> c.categoryId, c -> c));

        tools.forEach(tool -> {
            tool.setPhotos(List.of(findFirstPhotoByToolId(tool.getToolId())));
            tool.setIsAvailable(isToolAvailable(tool.getToolId()));
            tool.setCategory(categoryMap.get(tool.getCategoryId()));
        });

        return tools;
    }

    public Long getOwnerIdByToolId(Long toolId) {
        return em.createQuery("SELECT t.ownerId FROM Tool t WHERE t.toolId = :toolId", Long.class)
                .setParameter("toolId", toolId)
                .getSingleResult();
    }

    @SuppressWarnings("unchecked")
    public List<OwnerToolDTO> findToolsByOwnerId(Long userId) {
        List<Tuple> results = em.createNativeQuery("""
            SELECT 
                t.tool_id,
                t.name,
                t.price_per_day,
                (SELECT tp.photo_key FROM tool_photo tp WHERE tp.tool_id = t.tool_id LIMIT 1) AS photo_key,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM rental rt 
                        WHERE rt.tool_id = t.tool_id 
                        AND rt.status IN (:statusAprobada, :statusEnUso)
                        AND CURRENT_DATE BETWEEN rt.start_date AND rt.end_date
                    ) THEN FALSE
                    
                    WHEN r.rule_type = :ruleSiempre THEN TRUE
                    WHEN r.rule_type = :ruleLV THEN (DAYOFWEEK(CURRENT_DATE) BETWEEN 2 AND 6)
                    WHEN r.rule_type = :ruleFDS THEN (DAYOFWEEK(CURRENT_DATE) IN (1, 7))
                    WHEN r.rule_type = :ruleNoDisp THEN FALSE
                    
                    WHEN r.rule_type IS NULL THEN NOT EXISTS (
                        SELECT 1 FROM tool_availability_exception e 
                        WHERE e.tool_id = t.tool_id AND e.date = CURRENT_DATE
                    )
                    
                    ELSE FALSE 
                END AS is_available
            FROM tool t
            LEFT JOIN tool_availability_rule r ON t.tool_id = r.tool_id
            WHERE t.owner_id = :ownerId
        """, Tuple.class)
                .setParameter("ownerId", userId)
                .setParameter("statusAprobada", RentalStatus.Aprobada.name())
                .setParameter("statusEnUso", RentalStatus.En_Uso.name())
                .setParameter("ruleSiempre", ToolAvailabilityRuleType.Siempre.name())
                .setParameter("ruleLV", ToolAvailabilityRuleType.Lunes_a_Viernes.name())
                .setParameter("ruleFDS", ToolAvailabilityRuleType.Fines_de_semana.name())
                .setParameter("ruleNoDisp", ToolAvailabilityRuleType.No_disponible.name())
                .getResultList();

        return results.stream().map(t -> {

            Object availableObj = t.get("is_available");
            boolean available = false;
            if (availableObj instanceof Number n) {
                available = n.intValue() == 1;
            } else if (availableObj instanceof Boolean b) {
                available = b;
            }

            return OwnerToolDTO.builder()
                    .toolId(t.get("tool_id", Number.class).longValue())
                    .name(t.get("name", String.class))
                    .pricePerDay(t.get("price_per_day", BigDecimal.class))
                    .firstPhotoKey(t.get("photo_key", String.class))
                    .isAvailable(available)
                    .build();
        }).toList();
    }
}
