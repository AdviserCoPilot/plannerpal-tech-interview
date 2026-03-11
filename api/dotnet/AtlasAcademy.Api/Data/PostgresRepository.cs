using AtlasAcademy.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AtlasAcademy.Api.Data;

public class PostgresRepository : IAtlasRepository
{
    private readonly AtlasDbContext _context;

    public PostgresRepository(AtlasDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Parent>> GetParentsAsync()
    {
        return await _context.Parents
            .OrderBy(p => p.Name)
            .Select(p => new Parent(p.Id, p.Email, p.Name))
            .ToListAsync();
    }

    public async Task<IEnumerable<ClassEntity>> GetClassesAsync()
    {
        return await _context.Classes
            .OrderBy(c => c.StartTime)
            .Select(c => new ClassEntity(
                c.Id,
                c.Name,
                c.Description,
                c.Capacity,
                c.StartTime,
                c.EndTime,
                c.CreatedAt,
                c.Registrations.Count(r => r.Status == "registered")
            ))
            .ToListAsync();
    }

    public async Task<ClassEntity?> GetClassByIdAsync(Guid id)
    {
        return await _context.Classes
            .Where(c => c.Id == id)
            .Select(c => new ClassEntity(
                c.Id,
                c.Name,
                c.Description,
                c.Capacity,
                c.StartTime,
                c.EndTime,
                c.CreatedAt,
                c.Registrations.Count(r => r.Status == "registered")
            ))
            .FirstOrDefaultAsync();
    }

    public async Task<int> GetClassCapacityAsync(Guid classId)
    {
        var cls = await _context.Classes
            .Where(c => c.Id == classId)
            .Select(c => (int?)c.Capacity)
            .FirstOrDefaultAsync();

        return cls ?? -1;
    }

    public async Task<IEnumerable<Registration>> GetRegistrationsByParentAsync(Guid parentId)
    {
        return await _context.Registrations
            .Where(r => r.ParentId == parentId && r.Status == "registered")
            .OrderBy(r => r.Class.StartTime)
            .Select(r => new Registration(
                r.Id,
                r.ClassId,
                r.Status,
                r.Class.Name
            ))
            .ToListAsync();
    }

    public async Task<IEnumerable<AdminRegistration>> GetAllRegistrationsAsync()
    {
        return await _context.Registrations
            .Where(r => r.Status == "registered")
            .OrderBy(r => r.Class.StartTime)
            .ThenBy(r => r.Parent.Name)
            .Select(r => new AdminRegistration(
                r.Id,
                r.ClassId,
                r.Class.Name,
                r.Parent.Name,
                r.Parent.Email,
                r.CreatedAt
            ))
            .ToListAsync();
    }

    public async Task<long> CountRegisteredAsync(Guid classId)
    {
        return await _context.Registrations
            .CountAsync(r => r.ClassId == classId && r.Status == "registered");
    }

    public async Task RegisterAsync(Guid classId, Guid parentId)
    {
        var existing = await _context.Registrations
            .FirstOrDefaultAsync(r => r.ClassId == classId && r.ParentId == parentId);

        if (existing is not null)
        {
            existing.Status = "registered";
        }
        else
        {
            _context.Registrations.Add(new Entities.RegistrationEntity
            {
                Id = Guid.NewGuid(),
                ClassId = classId,
                ParentId = parentId,
                Status = "registered",
                CreatedAt = DateTimeOffset.UtcNow
            });
        }

        await _context.SaveChangesAsync();
    }

    public async Task<bool> RegistrationExistsActiveAsync(Guid id)
    {
        return await _context.Registrations
            .AnyAsync(r => r.Id == id && r.Status == "registered");
    }

    public async Task CancelRegistrationAsync(Guid id)
    {
        var registration = await _context.Registrations
            .FirstOrDefaultAsync(r => r.Id == id);

        if (registration is not null)
        {
            registration.Status = "cancelled";
            await _context.SaveChangesAsync();
        }
    }
}
