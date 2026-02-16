package com.atlas.academy.model;

import java.util.UUID;

public record Registration(UUID id, UUID classId, String status, String className) {}
