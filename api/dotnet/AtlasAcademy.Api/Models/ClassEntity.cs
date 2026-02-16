using System.Text.Json.Serialization;

namespace AtlasAcademy.Api.Models;

public record ClassEntity(
    Guid Id,
    string Name,
    string? Description,
    int Capacity,
    [property: JsonPropertyName("start_time")] DateTimeOffset StartTime,
    [property: JsonPropertyName("end_time")] DateTimeOffset EndTime,
    [property: JsonPropertyName("created_at")] DateTimeOffset CreatedAt,
    [property: JsonPropertyName("registered_count")] long RegisteredCount
);
