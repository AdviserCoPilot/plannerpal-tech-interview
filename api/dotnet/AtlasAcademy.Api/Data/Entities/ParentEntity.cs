using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AtlasAcademy.Api.Data.Entities;

[Table("parents")]
public class ParentEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<RegistrationEntity> Registrations { get; set; } = [];
}
