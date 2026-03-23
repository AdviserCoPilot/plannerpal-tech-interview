package com.atlas.academy.repository;

import com.atlas.academy.model.ClassEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClassJpaRepository extends JpaRepository<ClassEntity, UUID> {

    List<ClassEntity> findAllByOrderByStartTimeAsc();

    @Query("SELECT c.capacity FROM ClassEntity c WHERE c.id = :id")
    Integer findCapacityById(UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c.capacity FROM ClassEntity c WHERE c.id = :id")
    Integer findCapacityByIdForUpdate(UUID id);
}
