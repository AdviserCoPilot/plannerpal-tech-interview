using AtlasAcademy.Api.Models;

namespace AtlasAcademy.Api.Data;

public interface IAtlasRepository
{
    Task<IEnumerable<Parent>> GetParentsAsync();
    Task<IEnumerable<ClassEntity>> GetClassesAsync();
    Task<ClassEntity?> GetClassByIdAsync(Guid id);
    Task<int> GetClassCapacityAsync(Guid classId);
    Task<IEnumerable<Registration>> GetRegistrationsByParentAsync(Guid parentId);
    Task<IEnumerable<AdminRegistration>> GetAllRegistrationsAsync();
    Task<long> CountRegisteredAsync(Guid classId);
    Task RegisterAsync(Guid classId, Guid parentId);
    Task<string> RegisterWithLockAsync(Guid classId, Guid parentId);
    Task<bool> RegistrationExistsActiveAsync(Guid id);
    Task<bool> ParentExistsAsync(Guid id);
    Task<bool> CancelRegistrationAsync(Guid id);
}
