package com.atlas.academy.controller;

import com.atlas.academy.model.AdminRegistration;
import com.atlas.academy.model.RegisterRequest;
import com.atlas.academy.model.Registration;
import com.atlas.academy.repository.ClassRepository;
import com.atlas.academy.repository.RegistrationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/registrations")
public class RegistrationController {

    private final RegistrationRepository registrationRepo;
    private final ClassRepository classRepo;

    public RegistrationController(RegistrationRepository registrationRepo, ClassRepository classRepo) {
        this.registrationRepo = registrationRepo;
        this.classRepo = classRepo;
    }

    @GetMapping
    public ResponseEntity<?> getByParent(@RequestParam(required = false) String parentId) {
        if (parentId == null || parentId.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "parentId is required"));
        }
        try {
            UUID uuid = UUID.fromString(parentId);
            List<Registration> registrations = registrationRepo.findByParent(uuid);
            return ResponseEntity.ok(Map.of("registrations", registrations));
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
            List<AdminRegistration> registrations = registrationRepo.findAll();
            return ResponseEntity.ok(registrations);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch all registrations"));
        }
    }

    @PostMapping
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.classId() == null || request.classId().isBlank()
                || request.parentId() == null || request.parentId().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "classId and parentId are required"));
        }

        try {
            UUID classId = UUID.fromString(request.classId());
            UUID parentId = UUID.fromString(request.parentId());

            int capacity = classRepo.getCapacity(classId);
            if (capacity < 0) {
                return ResponseEntity.status(404)
                        .body(Map.of("error", "Class not found"));
            }

            long currentCount = registrationRepo.countRegistered(classId);
            if (currentCount > capacity) {
                return ResponseEntity.status(409)
                        .body(Map.of("error", "Class is full"));
            }

            registrationRepo.register(classId, parentId);
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
    public ResponseEntity<?> cancel(@PathVariable String id) {
        try {
            UUID uuid = UUID.fromString(id);
            if (!registrationRepo.existsActive(uuid)) {
                return ResponseEntity.status(404)
                        .body(Map.of("error", "Registration not found"));
            }
            registrationRepo.cancel(uuid);
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
