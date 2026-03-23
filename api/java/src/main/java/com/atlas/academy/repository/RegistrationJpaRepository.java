package com.atlas.academy.repository;

import com.atlas.academy.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RegistrationJpaRepository extends JpaRepository<Registration, UUID> {

    @Query("SELECT r FROM Registration r JOIN FETCH r.classEntity WHERE r.parent.id = :parentId AND r.status = 'registered' ORDER BY r.classEntity.startTime")
    List<Registration> findByParentIdAndStatusRegistered(UUID parentId);

    @Query("SELECT r FROM Registration r JOIN FETCH r.classEntity JOIN FETCH r.parent WHERE r.status = 'registered' ORDER BY r.classEntity.startTime, r.parent.name")
    List<Registration> findAllRegisteredWithDetails();

    long countByClassEntityIdAndStatus(UUID classEntityId, String status);

    @Query("SELECT r.classEntity.id, COUNT(r) FROM Registration r WHERE r.status = 'registered' GROUP BY r.classEntity.id")
    List<Object[]> countRegisteredGroupedByClassId();

    @Query("SELECT r FROM Registration r WHERE r.classEntity.id = :classId AND r.parent.id = :parentId")
    Registration findByClassIdAndParentId(UUID classId, UUID parentId);

    boolean existsByIdAndStatus(UUID id, String status);
}
