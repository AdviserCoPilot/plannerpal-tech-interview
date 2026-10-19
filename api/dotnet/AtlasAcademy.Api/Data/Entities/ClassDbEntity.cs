using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AtlasAcademy.Api.Data.Entities;

[Table("classes")]
public class ClassDbEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Column("capacity")]
    public int Capacity { get; set; }

    [Column("start_time")]
    public DateTimeOffset StartTime { get; set; }

    [Column("end_time")]
    public DateTimeOffset EndTime { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<RegistrationEntity> Registrations { get; set; } = [];
}
