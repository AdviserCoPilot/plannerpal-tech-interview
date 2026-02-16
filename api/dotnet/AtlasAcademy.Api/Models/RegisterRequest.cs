using System.Text.Json.Serialization;

namespace AtlasAcademy.Api.Models;

public record RegisterRequest(
    [property: JsonPropertyName("classId")] string? ClassId,
    [property: JsonPropertyName("parentId")] string? ParentId
);
