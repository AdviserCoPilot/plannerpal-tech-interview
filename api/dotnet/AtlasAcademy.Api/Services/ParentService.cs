using AtlasAcademy.Api.Data;
using AtlasAcademy.Api.Models;

namespace AtlasAcademy.Api.Services;

public class ParentService(IAtlasRepository repo) : IParentService
{
    public Task<IEnumerable<Parent>> ListAsync() => repo.GetParentsAsync();
}
