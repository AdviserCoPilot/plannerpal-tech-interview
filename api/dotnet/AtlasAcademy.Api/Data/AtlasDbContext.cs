using AtlasAcademy.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace AtlasAcademy.Api.Data;

public class AtlasDbContext : DbContext
{
    public AtlasDbContext(DbContextOptions<AtlasDbContext> options) : base(options) { }

    public DbSet<ClassDbEntity> Classes => Set<ClassDbEntity>();
    public DbSet<ParentEntity> Parents => Set<ParentEntity>();
    public DbSet<RegistrationEntity> Registrations => Set<RegistrationEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RegistrationEntity>(entity =>
        {
            entity.HasIndex(r => new { r.ClassId, r.ParentId }).IsUnique();
            entity.HasIndex(r => r.ClassId);
            entity.HasIndex(r => r.ParentId);
        });
    }
}
