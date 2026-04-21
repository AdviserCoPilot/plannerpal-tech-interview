package com.atlas.academy.service;

import com.atlas.academy.exception.ConflictException;
import com.atlas.academy.exception.NotFoundException;
import com.atlas.academy.model.AdminRegistration;
import com.atlas.academy.model.ClassEntity;
import com.atlas.academy.model.Registration;
import com.atlas.academy.model.RegistrationDto;
import com.atlas.academy.model.RegistrationResult;
import com.atlas.academy.repository.ClassJpaRepository;
import com.atlas.academy.repository.ParentJpaRepository;
import com.atlas.academy.repository.RegistrationJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class RegistrationService {

    private static final String STATUS_REGISTERED = "registered";

    private final RegistrationJpaRepository registrationRepo;
    private final ClassJpaRepository classRepo;
    private final ParentJpaRepository parentRepo;

    public RegistrationService(RegistrationJpaRepository registrationRepo,
                               ClassJpaRepository classRepo,
                               ParentJpaRepository parentRepo) {
        this.registrationRepo = registrationRepo;
        this.classRepo = classRepo;
        this.parentRepo = parentRepo;
    }

    @Transactional(readOnly = true)
    public List<RegistrationDto> findByParent(UUID parentId) {
        return registrationRepo.findByParentIdAndStatusRegistered(parentId).stream()
                .map(r -> {
                    ClassEntity cls = r.getClassEntity();
                    return new RegistrationDto(
                            r.getId(),
                            cls != null ? cls.getId() : null,
                            r.getStatus(),
                            cls != null ? cls.getName() : null
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminRegistration> findAll() {
        return registrationRepo.findAllRegisteredWithDetails().stream()
                .map(r -> new AdminRegistration(
                        r.getId(),
                        r.getClassEntity().getId(),
                        r.getClassEntity().getName(),
                        r.getParent().getName(),
                        r.getParent().getEmail(),
                        r.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public RegistrationResult register(UUID classId, UUID parentId) {
        ClassEntity classEntity = classRepo.findByIdForUpdate(classId);
        if (classEntity == null) {
            throw new NotFoundException("Class not found");
        }

        int capacity = classEntity.getCapacity() != null ? classEntity.getCapacity() : 0;
        long currentCount = registrationRepo.countByClassEntityIdAndStatus(classId, STATUS_REGISTERED);
        if (currentCount >= capacity) {
            throw new ConflictException("Class is full");
        }

        Registration existing = registrationRepo.findByClassIdAndParentId(classId, parentId);
        if (existing != null) {
            existing.setStatus(STATUS_REGISTERED);
            registrationRepo.save(existing);
        } else {
            Registration reg = new Registration();
            reg.setClassEntity(classRepo.getReferenceById(classId));
            reg.setParent(parentRepo.getReferenceById(parentId));
            reg.setStatus(STATUS_REGISTERED);
            registrationRepo.save(reg);
        }

        return new RegistrationResult(STATUS_REGISTERED, "Successfully registered for class");
    }

    @Transactional
    public void cancel(UUID id) {
        Registration reg = registrationRepo.findById(id)
                .filter(r -> STATUS_REGISTERED.equals(r.getStatus()))
                .orElseThrow(() -> new NotFoundException("Registration not found"));
        reg.setStatus("cancelled");
        registrationRepo.save(reg);
    }
}
