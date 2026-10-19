package com.atlas.academy.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AdminRegistration(
        UUID id,
        UUID classId,
        String className,
        String parentName,
        String parentEmail,
        OffsetDateTime createdAt
) {}
