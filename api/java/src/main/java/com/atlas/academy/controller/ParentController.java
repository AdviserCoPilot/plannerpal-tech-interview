package com.atlas.academy.controller;

import com.atlas.academy.model.Parent;
import com.atlas.academy.repository.ParentJpaRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/parents")
public class ParentController {

    private final ParentJpaRepository repo;

    public ParentController(ParentJpaRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Parent> list() {
        return repo.findAllByOrderByNameAsc();
    }
}
