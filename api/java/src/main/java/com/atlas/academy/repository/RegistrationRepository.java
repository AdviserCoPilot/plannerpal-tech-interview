package com.atlas.academy.repository;

import com.atlas.academy.model.AdminRegistration;
import com.atlas.academy.model.Registration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public class RegistrationRepository {

    private final JdbcTemplate jdbc;

    public RegistrationRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Registration> findByParent(UUID parentId) {
        return jdbc.query(
                """
                SELECT r.id, r.class_id, r.status, c.name as class_name
                FROM registrations r
                JOIN classes c ON c.id = r.class_id
                WHERE r.parent_id = ? AND r.status = 'registered'
                ORDER BY c.start_time
                """,
                (rs, rowNum) -> new Registration(
                        UUID.fromString(rs.getString("id")),
                        UUID.fromString(rs.getString("class_id")),
                        rs.getString("status"),
                        rs.getString("class_name")
                ),
                parentId
        );
    }

    public List<AdminRegistration> findAll() {
        return jdbc.query(
                """
                SELECT r.id, r.class_id, c.name as class_name,
                       p.name as parent_name, p.email as parent_email,
                       r.created_at
                FROM registrations r
                JOIN classes c ON c.id = r.class_id
                JOIN parents p ON p.id = r.parent_id
                WHERE r.status = 'registered'
                ORDER BY c.start_time, p.name
                """,
                (rs, rowNum) -> new AdminRegistration(
                        UUID.fromString(rs.getString("id")),
                        UUID.fromString(rs.getString("class_id")),
                        rs.getString("class_name"),
                        rs.getString("parent_name"),
                        rs.getString("parent_email"),
                        rs.getObject("created_at", OffsetDateTime.class)
                )
        );
    }

    public long countRegistered(UUID classId) {
        Long count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM registrations WHERE class_id = ? AND status = 'registered'",
                Long.class,
                classId
        );
        return count != null ? count : 0;
    }

    @Transactional
    public void register(UUID classId, UUID parentId) {
        jdbc.update(
                """
                INSERT INTO registrations (class_id, parent_id, status)
                VALUES (?, ?, 'registered')
                ON CONFLICT (class_id, parent_id)
                DO UPDATE SET status = 'registered'
                """,
                classId, parentId
        );
    }

    public boolean existsActive(UUID id) {
        Long count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM registrations WHERE id = ? AND status = 'registered'",
                Long.class,
                id
        );
        return count != null && count > 0;
    }

    public void cancel(UUID id) {
        jdbc.update(
                "UPDATE registrations SET status = 'cancelled' WHERE id = ?",
                id
        );
    }
}
