package com.atlas.academy.controller;

import com.atlas.academy.model.ClassDto;
import com.atlas.academy.model.ClassEntity;
import com.atlas.academy.repository.ClassJpaRepository;
import com.atlas.academy.repository.RegistrationJpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/classes")
public class ClassController {

    private final ClassJpaRepository classRepo;
    private final RegistrationJpaRepository registrationRepo;

    public ClassController(ClassJpaRepository classRepo, RegistrationJpaRepository registrationRepo) {
        this.classRepo = classRepo;
        this.registrationRepo = registrationRepo;
    }

    @GetMapping
    public ResponseEntity<?> list() {
        try {
            List<ClassEntity> classes = classRepo.findAllByOrderByStartTimeAsc();
            List<ClassDto> dtos = classes.stream().map(this::toDto).toList();
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch classes"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try {
            UUID uuid = UUID.fromString(id);
            Optional<ClassEntity> result = classRepo.findById(uuid);
            return result
                    .map(c -> ResponseEntity.ok((Object) toDto(c)))
                    .orElse(ResponseEntity.status(404)
                            .body(Map.of("error", "Class not found")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Class not found"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch class"));
        }
    }

    private ClassDto toDto(ClassEntity c) {
        long count = registrationRepo.countByClassEntityIdAndStatus(c.getId(), "registered");
        return new ClassDto(
                c.getId(), c.getName(), c.getDescription(), c.getCapacity(),
                c.getStartTime(), c.getEndTime(), c.getCreatedAt(), count
        );
    }
}
