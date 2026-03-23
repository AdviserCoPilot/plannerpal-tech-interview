package com.atlas.academy.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ClassDto(
        UUID id,
        String name,
        String description,
        Integer capacity,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        OffsetDateTime createdAt,
        long registeredCount
) {}
