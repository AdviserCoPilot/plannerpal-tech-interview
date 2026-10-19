using AtlasAcademy.Api.Models;

namespace AtlasAcademy.Api.Services;

public interface IParentService
{
    Task<IEnumerable<Parent>> ListAsync();
}
