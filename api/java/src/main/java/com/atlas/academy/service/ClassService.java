package com.atlas.academy.service;

import com.atlas.academy.exception.NotFoundException;
import com.atlas.academy.model.ClassDto;
import com.atlas.academy.model.ClassEntity;
import com.atlas.academy.repository.ClassJpaRepository;
import com.atlas.academy.repository.RegistrationJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ClassService {

    private final ClassJpaRepository classRepo;
    private final RegistrationJpaRepository registrationRepo;

    public ClassService(ClassJpaRepository classRepo, RegistrationJpaRepository registrationRepo) {
        this.classRepo = classRepo;
        this.registrationRepo = registrationRepo;
    }

    @Transactional(readOnly = true)
    public List<ClassDto> list() {
        Map<UUID, Long> countsByClassId = registrationRepo.countRegisteredGroupedByClassId().stream()
                .collect(Collectors.toMap(row -> (UUID) row[0], row -> (Long) row[1]));

        return classRepo.findAllByOrderByStartTimeAsc().stream()
                .map(c -> toDto(c, countsByClassId.getOrDefault(c.getId(), 0L)))
                .toList();
    }

    @Transactional(readOnly = true)
    public ClassDto findById(UUID id) {
        ClassEntity c = classRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Class not found"));
        return toDto(c, registrationRepo.countByClassEntityIdAndStatus(c.getId(), "registered"));
    }

    private ClassDto toDto(ClassEntity c, long registeredCount) {
        return new ClassDto(
                c.getId(), c.getName(), c.getDescription(),
                c.getCapacity() != null ? c.getCapacity() : 0,
                c.getStartTime(), c.getEndTime(), c.getCreatedAt(),
                registeredCount
        );
    }
}
