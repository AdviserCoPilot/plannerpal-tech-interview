package com.atlas.academy.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RegisterRequest(
        @JsonProperty("classId") String classId,
        @JsonProperty("parentId") String parentId
) {}
