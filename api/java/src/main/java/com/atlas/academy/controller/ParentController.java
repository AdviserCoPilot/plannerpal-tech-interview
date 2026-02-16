package com.atlas.academy.controller;

import com.atlas.academy.model.Parent;
import com.atlas.academy.repository.ParentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/parents")
public class ParentController {

    private final ParentRepository repo;

    public ParentController(ParentRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public ResponseEntity<?> list() {
        try {
            List<Parent> parents = repo.findAll();
            return ResponseEntity.ok(parents);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch parents"));
        }
    }
}
