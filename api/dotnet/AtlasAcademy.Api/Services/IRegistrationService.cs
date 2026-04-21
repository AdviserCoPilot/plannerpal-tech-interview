using AtlasAcademy.Api.Models;

namespace AtlasAcademy.Api.Services;

public interface IRegistrationService
{
    Task<IEnumerable<Registration>> FindByParentAsync(Guid parentId);
    Task<IEnumerable<AdminRegistration>> FindAllAsync();
    Task RegisterAsync(Guid classId, Guid parentId);
    Task CancelAsync(Guid id);
}
