package com.atlas.academy.model;

import java.util.UUID;

public record RegistrationDto(UUID id, UUID classId, String status, String className) {}
