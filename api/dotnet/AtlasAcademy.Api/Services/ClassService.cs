using AtlasAcademy.Api.Data;
using AtlasAcademy.Api.Exceptions;
using AtlasAcademy.Api.Models;

namespace AtlasAcademy.Api.Services;

public class ClassService(IAtlasRepository repo) : IClassService
{
    public Task<IEnumerable<ClassEntity>> ListAsync() => repo.GetClassesAsync();

    public async Task<ClassEntity> GetByIdAsync(Guid id)
    {
        var cls = await repo.GetClassByIdAsync(id);
        return cls ?? throw new NotFoundException("Class not found");
    }
}
