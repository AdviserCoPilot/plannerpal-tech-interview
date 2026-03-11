using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AtlasAcademy.Api.Data.Entities;

[Table("registrations")]
public class RegistrationEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("class_id")]
    public Guid ClassId { get; set; }

    [Column("parent_id")]
    public Guid ParentId { get; set; }

    [Column("status")]
    public string Status { get; set; } = "registered";

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }

    [ForeignKey(nameof(ClassId))]
    public ClassDbEntity Class { get; set; } = null!;

    [ForeignKey(nameof(ParentId))]
    public ParentEntity Parent { get; set; } = null!;
}
