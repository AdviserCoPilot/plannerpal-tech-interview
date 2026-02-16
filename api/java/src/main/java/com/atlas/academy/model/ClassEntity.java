package com.atlas.academy.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ClassEntity(
        UUID id,
        String name,
        String description,
        int capacity,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        OffsetDateTime createdAt,
        long registeredCount
) {}
