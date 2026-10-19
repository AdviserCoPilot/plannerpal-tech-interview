package com.atlas.academy.controller;

import com.atlas.academy.model.ClassDto;
import com.atlas.academy.service.ClassService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/classes")
public class ClassController {

    private final ClassService classService;

    public ClassController(ClassService classService) {
        this.classService = classService;
    }

    @GetMapping
    public List<ClassDto> list() {
        return classService.list();
    }

    @GetMapping("/{id}")
    public ClassDto getById(@PathVariable UUID id) {
        return classService.findById(id);
    }
}
