using AtlasAcademy.Api.Models;

namespace AtlasAcademy.Api.Services;

public interface IClassService
{
    Task<IEnumerable<ClassEntity>> ListAsync();
    Task<ClassEntity> GetByIdAsync(Guid id);
}
