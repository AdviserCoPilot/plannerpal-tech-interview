using System.Text.Json.Serialization;

namespace AtlasAcademy.Api.Models;

public record RegisterRequest(
    [property: JsonPropertyName("class_id")] string? ClassId,
    [property: JsonPropertyName("parent_id")] string? ParentId
);
