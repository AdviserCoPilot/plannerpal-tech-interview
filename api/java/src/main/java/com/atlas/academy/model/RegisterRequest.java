package com.atlas.academy.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RegisterRequest(
        @JsonProperty("classId") @NotNull(message = "is required") UUID classId,
        @JsonProperty("parentId") @NotNull(message = "is required") UUID parentId
) {}
