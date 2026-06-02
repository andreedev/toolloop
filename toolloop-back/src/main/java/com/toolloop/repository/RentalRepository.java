package com.toolloop.repository;

import com.toolloop.model.entity.Rental;
import com.toolloop.model.entity.Tool;
import com.toolloop.model.entity.ToolPhoto;
import com.toolloop.model.entity.User;
import com.toolloop.model.enums.RentalStatus;
import com.toolloop.model.enums.ReviewType;
import com.toolloop.util.S3KeyResolver;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.Tuple;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class RentalRepository extends BaseRepository<Rental> {

    @Inject
    EntityManager em;

    @Inject
    ToolRepository toolRepository;

    @Inject
    S3KeyResolver s3KeyResolver;

    public BigDecimal findTotalEarningsByUserId(Long userId) {
        String sql = "SELECT COALESCE(SUM(r.subtotal_amount), 0) " +
                "FROM rental r " +
                "INNER JOIN tool t ON r.tool_id = t.tool_id " +
                "WHERE t.owner_id = :userId";

        Object result = em.createNativeQuery(sql)
                .setParameter("userId", userId)
                .getSingleResult();

        return (result != null) ? new BigDecimal(result.toString()) : BigDecimal.ZERO;
    }

    public Integer countByRenterId(Long userId) {
        String sql = "SELECT COUNT(*) " +
                "FROM rental r " +
                "WHERE r.renter_id = :userId";

        Object result = em.createNativeQuery(sql)
                .setParameter("userId", userId)
                .getSingleResult();

        return (result != null) ? Integer.parseInt(result.toString()) : 0;
    }

    public Integer countActiveRentalsByRenterId(Long userId) {
        String sql = "SELECT COUNT(*) " +
                "FROM rental r " +
                "WHERE r.renter_id = :userId " +
                "AND r.status IN ('Aprobada', 'En_Uso')";

        Object result = em.createNativeQuery(sql)
                .setParameter("userId", userId)
                .getSingleResult();

        return (result != null) ? Integer.parseInt(result.toString()) : 0;
    }

    public Optional<Rental> findNextExpiringRentalByRenterId(Long userId) {
        String sql = "SELECT r.* " +
                "FROM rental r " +
                "WHERE r.renter_id = :userId " +
                "AND r.status IN ('En_Uso') " +
                "ORDER BY r.end_date ASC " +
                "LIMIT 1";

        try {
            Rental rental = (Rental) em.createNativeQuery(sql, Rental.class)
                    .setParameter("userId", userId)
                    .getSingleResult();

            toolRepository.findByIdWithFirstPhoto(rental.getToolId())
                    .ifPresent(rental::setTool);

            return Optional.of(rental);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }

    public List<Rental> findActiveByToolIdAndRange(Long toolId, LocalDate start, LocalDate end) {
        String sql = "SELECT r.* " +
                "FROM rental r " +
                "WHERE r.tool_id = :toolId " +
                "AND r.status IN ('Aprobada', 'En_Uso') " +
                "AND r.start_date <= :endDate " +
                "AND r.end_date >= :startDate";

        return em.createNativeQuery(sql, Rental.class)
                .setParameter("toolId", toolId)
                .setParameter("startDate", start)
                .setParameter("endDate", end)
                .getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Rental> findByOwnerId(Long currentUserId) {
        List<Tuple> rows = em.createNativeQuery("""
            SELECT
                r.rental_id          AS rental_id,
                r.tool_id            AS tool_id,
                r.renter_id          AS renter_id,
                r.start_date         AS start_date,
                r.end_date           AS end_date,
                r.daily_rate         AS daily_rate,
                r.subtotal_amount    AS subtotal_amount,
                r.deposit_amount     AS deposit_amount,
                r.total_amount       AS total_amount,
                r.total_days         AS total_days,
                r.status             AS status,
                t.tool_id            AS tool_id_t,
                t.name               AS tool_name,
                t.`condition`        AS tool_condition,
                (SELECT tp.photo_key FROM tool_photo tp
                 WHERE tp.tool_id = t.tool_id ORDER BY tp.created_at ASC LIMIT 1) AS first_photo_key,
                rn.user_id           AS user_id,
                rn.name              AS user_name,
                rn.profile_photo_key AS user_photo_key,
                (SELECT AVG(rv.user_rating) FROM review rv
                 WHERE rv.reviewee_id = rn.user_id) AS user_rating,
                EXISTS (SELECT 1 FROM review rv2
                        WHERE rv2.rental_id = r.rental_id
                          AND rv2.review_type = :ownerToRenter) AS has_review
            FROM rental r
            JOIN tool t  ON r.tool_id = t.tool_id
            JOIN user rn ON r.renter_id = rn.user_id
            WHERE t.owner_id = :currentUserId
            ORDER BY r.created_at DESC
        """, Tuple.class)
                .setParameter("currentUserId", currentUserId)
                .setParameter("ownerToRenter", ReviewType.OWNER_TO_RENTER.name())
                .getResultList();

        return rows.stream().map(t -> {
            Rental rental = mapRentalScalars(t);

            Tool tool = new Tool();
            tool.toolId = t.get("tool_id_t", Number.class).longValue();
            tool.name = t.get("tool_name", String.class);
            String condition = t.get("tool_condition", String.class);
            if (condition != null) tool.condition = Tool.ToolCondition.valueOf(condition);
            tool.photos = resolvePhotos(t.get("first_photo_key", String.class));
            rental.tool = tool;

            rental.renter = User.builder()
                    .id(t.get("user_id", Number.class).longValue())
                    .name(t.get("user_name", String.class))
                    .profilePhotoKey(s3KeyResolver.toUrl(t.get("user_photo_key", String.class)))
                    .averageRating(formatRating(toBigDecimal(t.get("user_rating"))))
                    .build();

            rental.hasReviewFromOwner = isTrue(t.get("has_review", Number.class));
            return rental;
        }).toList();
    }

    @SuppressWarnings("unchecked")
    public List<Rental> findByRenterId(Long currentUserId) {
        List<Tuple> rows = em.createNativeQuery("""
            SELECT
                r.rental_id          AS rental_id,
                r.tool_id            AS tool_id,
                r.renter_id          AS renter_id,
                r.start_date         AS start_date,
                r.end_date           AS end_date,
                r.daily_rate         AS daily_rate,
                r.subtotal_amount    AS subtotal_amount,
                r.deposit_amount     AS deposit_amount,
                r.total_amount       AS total_amount,
                r.total_days         AS total_days,
                r.status             AS status,
                t.tool_id            AS tool_id_t,
                t.name               AS tool_name,
                (SELECT tp.photo_key FROM tool_photo tp
                 WHERE tp.tool_id = t.tool_id ORDER BY tp.created_at ASC LIMIT 1) AS first_photo_key,
                o.user_id            AS user_id,
                o.name               AS user_name,
                o.profile_photo_key  AS user_photo_key,
                EXISTS (SELECT 1 FROM review rv
                        WHERE rv.rental_id = r.rental_id
                          AND rv.review_type = :renterToOwner) AS has_review
            FROM rental r
            JOIN tool t ON r.tool_id = t.tool_id
            JOIN user o ON t.owner_id = o.user_id
            WHERE r.renter_id = :currentUserId
            ORDER BY r.created_at DESC
        """, Tuple.class)
                .setParameter("currentUserId", currentUserId)
                .setParameter("renterToOwner", ReviewType.RENTER_TO_OWNER.name())
                .getResultList();

        return rows.stream().map(t -> {
            Rental rental = mapRentalScalars(t);

            Tool tool = new Tool();
            tool.toolId = t.get("tool_id_t", Number.class).longValue();
            tool.name = t.get("tool_name", String.class);
            tool.photos = resolvePhotos(t.get("first_photo_key", String.class));
            rental.tool = tool;

            rental.owner = User.builder()
                    .id(t.get("user_id", Number.class).longValue())
                    .name(t.get("user_name", String.class))
                    .profilePhotoKey(s3KeyResolver.toUrl(t.get("user_photo_key", String.class)))
                    .build();

            rental.hasReviewFromRenter = isTrue(t.get("has_review", Number.class));
            rental.calculateDaysRemaining();
            return rental;
        }).toList();
    }

    private Rental mapRentalScalars(Tuple t) {
        Rental rental = new Rental();
        rental.rentalId = t.get("rental_id", Number.class).longValue();
        rental.toolId = t.get("tool_id", Number.class).longValue();
        rental.renterId = t.get("renter_id", Number.class).longValue();
        rental.startDate = toLocalDate(t.get("start_date"));
        rental.endDate = toLocalDate(t.get("end_date"));
        rental.dailyRate = t.get("daily_rate", BigDecimal.class);
        rental.subtotalAmount = t.get("subtotal_amount", BigDecimal.class);
        rental.depositAmount = t.get("deposit_amount", BigDecimal.class);
        rental.totalAmount = t.get("total_amount", BigDecimal.class);
        rental.totalDays = t.get("total_days", Number.class).intValue();
        rental.status = RentalStatus.valueOf(t.get("status", String.class));
        return rental;
    }

    private List<ToolPhoto> resolvePhotos(String firstPhotoKey) {
        if (firstPhotoKey == null) return List.of();
        ToolPhoto photo = new ToolPhoto();
        photo.photoKey = s3KeyResolver.toUrl(firstPhotoKey);
        return List.of(photo);
    }

    private static boolean isTrue(Number value) {
        return value != null && value.intValue() == 1;
    }

    private static LocalDate toLocalDate(Object value) {
        if (value instanceof java.sql.Date d) return d.toLocalDate();
        if (value instanceof LocalDate l) return l;
        return null;
    }

    private static BigDecimal formatRating(BigDecimal value) {
        BigDecimal rating = value != null ? value : BigDecimal.ZERO;
        return rating.setScale(1, RoundingMode.HALF_UP);
    }

    private static BigDecimal toBigDecimal(Object value) {
        if (value == null) return null;
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return null;
    }

    public boolean existsAnyByToolId(Long toolId) {
        String sql = "SELECT COUNT(*) FROM rental WHERE tool_id = :toolId";

        Object result = em.createNativeQuery(sql)
                .setParameter("toolId", toolId)
                .getSingleResult();

        return (result != null) && Integer.parseInt(result.toString()) > 0;
    }

    public Optional<Rental> findById(Long rentalId) {
        return Optional.ofNullable(em.find(Rental.class, rentalId));
    }
}
