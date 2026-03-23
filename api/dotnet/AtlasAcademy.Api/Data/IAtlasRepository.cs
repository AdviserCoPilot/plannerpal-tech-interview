using AtlasAcademy.Api.Models;

namespace AtlasAcademy.Api.Data;

public interface IAtlasRepository
{
    Task<IEnumerable<Parent>> GetParentsAsync();
    Task<IEnumerable<ClassEntity>> GetClassesAsync();
    Task<ClassEntity?> GetClassByIdAsync(Guid id);
    Task<IEnumerable<Registration>> GetRegistrationsByParentAsync(Guid parentId);
    Task<IEnumerable<AdminRegistration>> GetAllRegistrationsAsync();
    Task<string> RegisterWithLockAsync(Guid classId, Guid parentId);
    Task<bool> ParentExistsAsync(Guid id);
    Task<bool> CancelRegistrationAsync(Guid id);
}
