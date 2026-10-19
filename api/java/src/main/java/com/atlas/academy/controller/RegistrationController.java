package com.atlas.academy.controller;

import com.atlas.academy.model.AdminRegistration;
import com.atlas.academy.model.RegisterRequest;
import com.atlas.academy.model.RegistrationDto;
import com.atlas.academy.model.RegistrationResult;
import com.atlas.academy.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @GetMapping
    public Map<String, List<RegistrationDto>> getByParent(@RequestParam UUID parentId) {
        return Map.of("registrations", registrationService.findByParent(parentId));
    }

    @GetMapping("/all")
    public List<AdminRegistration> getAll() {
        return registrationService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RegistrationResult register(@Valid @RequestBody RegisterRequest request) {
        return registrationService.register(request.classId(), request.parentId());
    }

    @DeleteMapping("/{id}")
    public Map<String, String> cancel(@PathVariable UUID id) {
        registrationService.cancel(id);
        return Map.of("message", "Registration cancelled");
    }
}
