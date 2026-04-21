using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AtlasAcademy.Api.Models;

public record RegisterRequest(
    [property: JsonPropertyName("class_id")][Required] Guid? ClassId,
    [property: JsonPropertyName("parent_id")][Required] Guid? ParentId
);
