package com.atlas.academy.repository;

import com.atlas.academy.model.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ParentJpaRepository extends JpaRepository<Parent, UUID> {

    List<Parent> findAllByOrderByNameAsc();
}
