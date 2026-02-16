package com.atlas.academy.repository;

import com.atlas.academy.model.ClassEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class ClassRepository {

    private final JdbcTemplate jdbc;

    public ClassRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final String SELECT_WITH_COUNT = """
            SELECT c.*,
                (SELECT COUNT(*) FROM registrations r
                 WHERE r.class_id = c.id AND r.status = 'registered') as registered_count
            FROM classes c
            """;

    public List<ClassEntity> findAll() {
        return jdbc.query(
                SELECT_WITH_COUNT + " ORDER BY c.start_time ASC",
                (rs, rowNum) -> mapRow(rs)
        );
    }

    public Optional<ClassEntity> findById(UUID id) {
        List<ClassEntity> results = jdbc.query(
                SELECT_WITH_COUNT + " WHERE c.id = ?",
                (rs, rowNum) -> mapRow(rs),
                id
        );
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public int getCapacity(UUID id) {
        List<Integer> results = jdbc.query(
                "SELECT capacity FROM classes WHERE id = ?",
                (rs, rowNum) -> rs.getInt("capacity"),
                id
        );
        return results.isEmpty() ? -1 : results.get(0);
    }

    private ClassEntity mapRow(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new ClassEntity(
                UUID.fromString(rs.getString("id")),
                rs.getString("name"),
                rs.getString("description"),
                rs.getInt("capacity"),
                rs.getObject("start_time", OffsetDateTime.class),
                rs.getObject("end_time", OffsetDateTime.class),
                rs.getObject("created_at", OffsetDateTime.class),
                rs.getLong("registered_count")
        );
    }
}
