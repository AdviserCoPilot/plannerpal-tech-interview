package com.atlas.academy.controller;

import com.atlas.academy.model.ClassEntity;
import com.atlas.academy.repository.ClassRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/classes")
public class ClassController {

    private final ClassRepository repo;

    public ClassController(ClassRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public ResponseEntity<?> list() {
        try {
            List<ClassEntity> classes = repo.findAll();
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch classes"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try {
            UUID uuid = UUID.fromString(id);
            return repo.findById(uuid)
                    .map(c -> ResponseEntity.ok((Object) c))
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
}
