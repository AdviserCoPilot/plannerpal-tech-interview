package com.atlas.academy.repository;

import com.atlas.academy.model.Parent;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class ParentRepository {

    private final JdbcTemplate jdbc;

    public ParentRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Parent> findAll() {
        return jdbc.query(
                "SELECT id, email, name FROM parents ORDER BY name",
                (rs, rowNum) -> new Parent(
                        UUID.fromString(rs.getString("id")),
                        rs.getString("email"),
                        rs.getString("name")
                )
        );
    }
}
