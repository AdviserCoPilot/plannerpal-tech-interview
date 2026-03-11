package com.atlas.academy.controller;

import com.atlas.academy.model.*;
import com.atlas.academy.repository.ClassJpaRepository;
import com.atlas.academy.repository.ParentJpaRepository;
import com.atlas.academy.repository.RegistrationJpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/registrations")
public class RegistrationController {

    private final RegistrationJpaRepository registrationRepo;
    private final ClassJpaRepository classRepo;
    private final ParentJpaRepository parentRepo;

    public RegistrationController(RegistrationJpaRepository registrationRepo,
                                  ClassJpaRepository classRepo,
                                  ParentJpaRepository parentRepo) {
        this.registrationRepo = registrationRepo;
        this.classRepo = classRepo;
        this.parentRepo = parentRepo;
    }

    @GetMapping
    public ResponseEntity<?> getByParent(@RequestParam(required = false) String parentId) {
        if (parentId == null || parentId.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "parentId is required"));
        }
        try {
            UUID uuid = UUID.fromString(parentId);
            List<Registration> registrations = registrationRepo.findByParentIdAndStatusRegistered(uuid);
            List<RegistrationDto> dtos = registrations.stream()
                    .map(r -> new RegistrationDto(r.getId(), r.getClassEntity().getId(), r.getStatus(), r.getClassEntity().getName()))
                    .toList();
            return ResponseEntity.ok(Map.of("registrations", dtos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid parentId"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch registrations"));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        try {
            List<Registration> registrations = registrationRepo.findAllRegisteredWithDetails();
            List<AdminRegistration> dtos = registrations.stream()
                    .map(r -> new AdminRegistration(
                            r.getId(),
                            r.getClassEntity().getId(),
                            r.getClassEntity().getName(),
                            r.getParent().getName(),
                            r.getParent().getEmail(),
                            r.getCreatedAt()
                    ))
                    .toList();
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch all registrations"));
        }
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.classId() == null || request.classId().isBlank()
                || request.parentId() == null || request.parentId().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "classId and parentId are required"));
        }

        try {
            UUID classId = UUID.fromString(request.classId());
            UUID parentId = UUID.fromString(request.parentId());

            Integer capacity = classRepo.findCapacityById(classId);
            if (capacity == null) {
                return ResponseEntity.status(404)
                        .body(Map.of("error", "Class not found"));
            }

            long currentCount = registrationRepo.countByClassEntityIdAndStatus(classId, "registered");
            if (currentCount >= capacity) {
                return ResponseEntity.status(409)
                        .body(Map.of("error", "Class is full"));
            }

            // Upsert: find existing or create new
            Registration existing = registrationRepo.findByClassIdAndParentId(classId, parentId);
            if (existing != null) {
                existing.setStatus("registered");
                registrationRepo.save(existing);
            } else {
                Registration reg = new Registration();
                reg.setClassEntity(classRepo.getReferenceById(classId));
                reg.setParent(parentRepo.getReferenceById(parentId));
                reg.setStatus("registered");
                registrationRepo.save(reg);
            }

            return ResponseEntity.status(201)
                    .body(Map.of("status", "registered", "message", "Successfully registered for class"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid classId or parentId"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to register"));
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> cancel(@PathVariable String id) {
        try {
            UUID uuid = UUID.fromString(id);
            if (!registrationRepo.existsByIdAndStatus(uuid, "registered")) {
                return ResponseEntity.status(404)
                        .body(Map.of("error", "Registration not found"));
            }
            Registration reg = registrationRepo.getReferenceById(uuid);
            reg.setStatus("cancelled");
            registrationRepo.save(reg);
            return ResponseEntity.ok(Map.of("message", "Registration cancelled"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Registration not found"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to cancel registration"));
        }
    }
}
