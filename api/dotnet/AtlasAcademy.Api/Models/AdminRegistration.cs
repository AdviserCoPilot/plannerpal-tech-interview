using System.Text.Json.Serialization;

namespace AtlasAcademy.Api.Models;

public record AdminRegistration(
    Guid Id,
    [property: JsonPropertyName("class_id")] Guid ClassId,
    [property: JsonPropertyName("class_name")] string ClassName,
    [property: JsonPropertyName("parent_name")] string ParentName,
    [property: JsonPropertyName("parent_email")] string ParentEmail,
    [property: JsonPropertyName("created_at")] DateTimeOffset CreatedAt
);
