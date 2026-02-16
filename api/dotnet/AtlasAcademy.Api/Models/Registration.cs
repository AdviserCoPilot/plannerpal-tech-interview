using System.Text.Json.Serialization;

namespace AtlasAcademy.Api.Models;

public record Registration(
    Guid Id,
    [property: JsonPropertyName("class_id")] Guid ClassId,
    string Status,
    [property: JsonPropertyName("class_name")] string ClassName
);
